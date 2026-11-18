import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Camera,
  CheckCircle2,
  FileCheck2,
  ImagePlus,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { compressImage } from "../../../lib/imageUtils";
import { useAppContext } from "../../AppContext";
import type { IdentityDocumentType } from "../../../lib/types";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string | null;
  required?: boolean;
  onChange: Dispatch<SetStateAction<string | null>>;
  setError: Dispatch<SetStateAction<string | null>>;
  maxDimension?: number;
  quality?: number;
}

function ImageUploadField({
  id,
  label,
  value,
  required = false,
  onChange,
  setError,
  maxDimension = 900,
  quality = 0.62,
}: ImageUploadFieldProps) {
  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Images must be 10MB or smaller before upload.");
      return;
    }
    try {
      onChange(await compressImage(file, maxDimension, quality));
      setError(null);
    } catch {
      setError(`Could not process ${label.toLowerCase()}. Please try another image.`);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-800">
            {label} {required && <span className="text-rose-600">*</span>}
          </p>
          {!required && <p className="mt-0.5 text-[10px] text-slate-500">Optional back side</p>}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Remove ${label}`}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-rose-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {value ? (
        <img
          src={value}
          alt={`${label} preview`}
          className="mt-2 h-28 w-full rounded-xl border border-slate-200 object-contain bg-slate-50"
        />
      ) : (
        <label
          htmlFor={id}
          className="mt-2 flex min-h-20 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-600 hover:border-emerald-500 hover:bg-emerald-50"
        >
          <Upload className="h-4 w-4 text-emerald-700" />
          Select image
        </label>
      )}
      <input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void handleFile(file);
        }}
      />
    </div>
  );
}

interface FaceBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectedFace {
  boundingBox: FaceBounds;
}

interface NativeFaceDetector {
  detect(source: HTMLVideoElement): Promise<DetectedFace[]>;
}

interface NativeFaceDetectorConstructor {
  new (options?: { fastMode?: boolean; maxDetectedFaces?: number }): NativeFaceDetector;
}

function cropSelfie(video: HTMLVideoElement, face?: FaceBounds): string | null {
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  if (!videoWidth || !videoHeight) return null;

  let sourceX: number;
  let sourceY: number;
  let sourceSize: number;
  if (face) {
    sourceSize = Math.min(
      Math.max(face.width, face.height) * 1.8,
      videoWidth,
      videoHeight,
    );
    sourceX = face.x + face.width / 2 - sourceSize / 2;
    sourceY = face.y + face.height / 2 - sourceSize * 0.43;
    sourceX = Math.max(0, Math.min(sourceX, videoWidth - sourceSize));
    sourceY = Math.max(0, Math.min(sourceY, videoHeight - sourceSize));
  } else {
    sourceSize = Math.min(videoWidth, videoHeight);
    sourceX = (videoWidth - sourceSize) / 2;
    sourceY = (videoHeight - sourceSize) / 2;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 480;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(
    video,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return canvas.toDataURL("image/jpeg", 0.68);
}

function SelfieCapture({
  value,
  onChange,
  setError,
}: {
  value: string | null;
  onChange: Dispatch<SetStateAction<string | null>>;
  setError: Dispatch<SetStateAction<string | null>>;
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureMode, setCaptureMode] = useState<"idle" | "detecting" | "manual">("idle");
  const [status, setStatus] = useState("A clear selfie is required for verification.");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!stream) return;
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    void video.play().catch(() => {
      setError("Could not start the camera preview. Check browser camera permissions.");
      setStream(null);
    });

    const detectorConstructor = (
      window as Window & { FaceDetector?: NativeFaceDetectorConstructor }
    ).FaceDetector;
    let detector: NativeFaceDetector | null = null;
    if (detectorConstructor) {
      try {
        detector = new detectorConstructor({ fastMode: true, maxDetectedFaces: 1 });
      } catch {
        detector = null;
      }
    }

    let stopped = false;
    let timeoutId = 0;
    let centeredFrames = 0;
    setCaptureMode(detector ? "detecting" : "manual");
    setStatus(
      detector
        ? "Center your face in the frame. The camera will capture automatically."
        : "Automatic face detection is unavailable. Use the capture button when ready.",
    );

    const scanForFace = async () => {
      if (stopped) return;
      if (!detector) return;
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        timeoutId = window.setTimeout(scanForFace, 250);
        return;
      }
      try {
        const [face] = await detector.detect(video);
        if (face) {
          const { x, y, width, height } = face.boundingBox;
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const centered =
            width / video.videoWidth > 0.16 &&
            centerX / video.videoWidth > 0.25 &&
            centerX / video.videoWidth < 0.75 &&
            centerY / video.videoHeight > 0.2 &&
            centerY / video.videoHeight < 0.75;
          centeredFrames = centered ? centeredFrames + 1 : 0;
          setStatus(
            centered
              ? "Face detected. Hold still for a moment..."
              : "Move into the center of the frame and look at the camera.",
          );
          if (centeredFrames >= 3) {
            const selfie = cropSelfie(video, face.boundingBox);
            if (selfie) {
              onChange(selfie);
              setStream(null);
              setCaptureMode("idle");
              setStatus("Selfie captured successfully.");
              return;
            }
          }
        } else {
          centeredFrames = 0;
          setStatus("Looking for your face. Move into the camera frame.");
        }
      } catch {
        detector = null;
        setCaptureMode("manual");
        setStatus("Face detection stopped. You can take the selfie manually.");
      }
      if (!stopped && detector) timeoutId = window.setTimeout(scanForFace, 250);
    };

    void scanForFace();
    return () => {
      stopped = true;
      window.clearTimeout(timeoutId);
      stream.getTracks().forEach((track) => track.stop());
    };
  }, [stream, onChange, setError]);

  const startCamera = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser cannot access a camera. Please use a camera-enabled browser.");
      return;
    }
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
      });
      setStream(cameraStream);
      setStatus("Starting camera...");
    } catch {
      setError("Camera access was denied or unavailable. Allow camera access and try again.");
    }
  };

  const captureManually = () => {
    const video = videoRef.current;
    if (!video) return;
    const selfie = cropSelfie(video);
    if (!selfie) {
      setError("Camera is not ready yet. Please wait a moment and try again.");
      return;
    }
    onChange(selfie);
    setStream(null);
    setCaptureMode("idle");
    setStatus("Selfie captured successfully.");
    setError(null);
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800">
          <Camera className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900">
            Live selfie <span className="text-rose-600">*</span>
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Turn on your camera and look toward it. When supported, face detection
            captures automatically; you can also take it manually.
          </p>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="aspect-video w-full object-cover"
            />
          ) : value ? (
            <img src={value} alt="Selfie preview" className="aspect-video w-full object-contain" />
          ) : (
            <div className="flex aspect-video items-center justify-center text-slate-400">
              <Camera className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-2">
          <p aria-live="polite" className="text-[11px] leading-relaxed text-slate-600">
            {status}
          </p>
          {stream ? (
            <>
              <button
                type="button"
                onClick={captureManually}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                <Camera className="h-4 w-4" />
                Capture now
              </button>
              <button
                type="button"
                onClick={() => setStream(null)}
                className="rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-white"
              >
                Stop camera
              </button>
              {captureMode === "detecting" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800">
                  <CheckCircle2 className="h-3 w-3" /> Auto capture enabled
                </span>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                <Camera className="h-4 w-4" />
                {value ? "Retake selfie" : "Start camera"}
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-white"
                >
                  Remove selfie
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function RegistrationMediaFields() {
  const {
    authRoleChoice,
    regTeacherProfilePic,
    setRegTeacherProfilePic,
    regStudentProfilePic,
    setRegStudentProfilePic,
    regIdentityDocumentType,
    setRegIdentityDocumentType,
    regIdentityFront,
    setRegIdentityFront,
    regIdentityBack,
    setRegIdentityBack,
    regStudentIdFront,
    setRegStudentIdFront,
    regStudentIdBack,
    setRegStudentIdBack,
    regSelfiePhoto,
    setRegSelfiePhoto,
    setAuthError,
  } = useAppContext();
  const isTeacher = authRoleChoice === "TUTOR";
  const profilePicture = isTeacher ? regTeacherProfilePic : regStudentProfilePic;
  const setProfilePicture = isTeacher ? setRegTeacherProfilePic : setRegStudentProfilePic;

  return (
    <div className="space-y-4 rounded-3xl border border-emerald-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Photos & verification</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Your documents and selfie are private and reviewed only by the Porabo
            admin team. Images are resized before upload.
          </p>
        </div>
      </div>

      <ImageUploadField
        id="registration-profile-picture"
        label={`${isTeacher ? "Teacher" : "Student"} profile picture`}
        value={profilePicture}
        required
        onChange={setProfilePicture}
        setError={setAuthError}
        maxDimension={200}
        quality={0.6}
      />
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-emerald-700" />
          <h3 className="text-xs font-bold text-slate-800">Identity documents</h3>
        </div>
        <label className="block text-xs font-medium text-slate-700">
          Government document type <span className="text-rose-600">*</span>
          <select
            value={regIdentityDocumentType}
            onChange={(event) =>
              setRegIdentityDocumentType(event.target.value as IdentityDocumentType)
            }
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-600"
          >
            <option value="NID">National ID (NID)</option>
            <option value="BIRTH_CERTIFICATE">Birth certificate</option>
          </select>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <ImageUploadField
            id="registration-identity-front"
            label={`${regIdentityDocumentType === "NID" ? "NID" : "Birth certificate"} front`}
            value={regIdentityFront}
            required
            onChange={setRegIdentityFront}
            setError={setAuthError}
          />
          <ImageUploadField
            id="registration-identity-back"
            label={`${regIdentityDocumentType === "NID" ? "NID" : "Birth certificate"} back`}
            value={regIdentityBack}
            onChange={setRegIdentityBack}
            setError={setAuthError}
          />
          <ImageUploadField
            id="registration-student-id-front"
            label="School / institution ID front"
            value={regStudentIdFront}
            required
            onChange={setRegStudentIdFront}
            setError={setAuthError}
          />
          <ImageUploadField
            id="registration-student-id-back"
            label="School / institution ID back"
            value={regStudentIdBack}
            onChange={setRegStudentIdBack}
            setError={setAuthError}
          />
        </div>
      </div>

      <SelfieCapture
        value={regSelfiePhoto}
        onChange={setRegSelfiePhoto}
        setError={setAuthError}
      />

      <p className="flex items-center gap-1.5 text-[10px] leading-relaxed text-slate-500">
        <ImagePlus className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
        Up to 10MB per source image. Back-side images are optional.
      </p>
    </div>
  );
}
