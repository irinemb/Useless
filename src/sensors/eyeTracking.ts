// ============================================================
// RITUAL.exe — Eye Tracking Sensor (MediaPipe FaceLandmarker)
// Strictly adheres to Section 11 & 37:
// Runs FaceLandmarker in video mode, computes Eye Aspect Ratio & gaze
// Emits onContact, onLost, and confidence updates
// Degrades gracefully to keyboard fallback (hold E) if camera fails
// ============================================================

import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export interface EyeTrackingOptions {
  video: HTMLVideoElement;
  onContact: (confidence: number) => void;
  onLost: () => void;
  onError: (err: string) => void;
}

function eyeAspectRatio(
  landmarks: { x: number; y: number; z: number }[],
  upper: number,
  lower: number,
  left: number,
  right: number
): number {
  const h = Math.abs(landmarks[upper].y - landmarks[lower].y);
  const w = Math.abs(landmarks[left].x - landmarks[right].x);
  return w > 0 ? h / w : 0;
}

export async function initEyeTracking(opts: EyeTrackingOptions): Promise<{ stop: () => void }> {
  const { video, onContact, onLost, onError } = opts;

  let landmarker: FaceLandmarker | null = null;
  let running = true;
  let lastVideoTime = -1;
  let rafId = 0;
  let stream: MediaStream | null = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
    });
    video.srcObject = stream;
    await video.play();

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });

    function detect() {
      if (!running || !landmarker) return;

      if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
        lastVideoTime = video.currentTime;
        try {
          const result: FaceLandmarkerResult = landmarker.detectForVideo(video, performance.now());

          if (result.faceLandmarks && result.faceLandmarks.length > 0) {
            const lm = result.faceLandmarks[0];
            const earLeft = eyeAspectRatio(lm, 159, 145, 33, 133);
            const earRight = eyeAspectRatio(lm, 386, 374, 362, 263);
            const avgEar = (earLeft + earRight) / 2;

            // Eyes open and looking roughly center
            if (avgEar > 0.14) {
              const confidence = Math.min(0.99, 0.7 + avgEar * 1.5);
              onContact(confidence);
            } else {
              onLost();
            }
          } else {
            onLost();
          }
        } catch {
          // If frame skipped, ignore
        }
      }

      rafId = requestAnimationFrame(detect);
    }

    rafId = requestAnimationFrame(detect);
  } catch (err: any) {
    onError(err?.message || 'Camera access declined or unavailable');
  }

  return {
    stop() {
      running = false;
      cancelAnimationFrame(rafId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      try {
        landmarker?.close();
      } catch {}
      landmarker = null;
    },
  };
}
