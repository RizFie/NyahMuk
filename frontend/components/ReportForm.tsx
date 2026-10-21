'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReportMap from './ReportMap';
import { submitReport } from '@/lib/api';
import type { Report } from '@/lib/types';
import { getPhotoLocation } from '@/lib/photoLocation';
import { TOWNSHIP_BOUNDS } from '@/lib/config';

const AI_LABELS: Record<Report['ai_check']['label'], string> = {
  tyre: 'Tyre',
  drain: 'Drain',
  flowerpot: 'Flower pot',
  bottle: 'Bottle',
  coconut_shell: 'Coconut shell',
  none: 'No object',
  unknown: 'Unknown object',
};

interface ReportFormProps {
  onClear?: () => void;
}

export default function ReportForm({ onClear }: ReportFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [gpsState, setGpsState] = useState<'idle' | 'loading' | 'success' | 'error' | 'manual'>('idle');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locationSource, setLocationSource] = useState<'photo' | 'device' | 'pin' | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<Report | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const locationRequestRef = useRef(0);

  // Clean up object URL when component unmounts or photo changes
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const requestDeviceLocation = (requestId: number) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      if (requestId === locationRequestRef.current) setGpsState('error');
      return;
    }

    setGpsState('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId !== locationRequestRef.current) return;
        setGpsCoords({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy });
        setLocationSource('device');
        setGpsState('success');
      },
      (error) => {
        console.warn('Geolocation acquisition error:', error);
        if (requestId === locationRequestRef.current) {
          setLocationSource(null);
          setGpsState('error');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const requestGPS = () => {
    const requestId = ++locationRequestRef.current;
    requestDeviceLocation(requestId);
  };

  const detectPhotoLocation = async (file: File) => {
    const requestId = ++locationRequestRef.current;
    setGpsState('loading');
    setGpsCoords(null);
    setLocationSource(null);

    const location = await getPhotoLocation(file);
    if (requestId !== locationRequestRef.current) return;
    if (location) {
      setGpsCoords(location);
      setLocationSource('photo');
      setGpsState('success');
      return;
    }

    requestDeviceLocation(requestId);
  };

  const onPhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    setPhoto(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    void detectPhotoLocation(file);
  };

  const handleMapSelect = (lat: number, lng: number) => {
    setGpsCoords({ lat, lng });
    setLocationSource('pin');
    setGpsState('manual');
  };

  // Clear all form state
  const handleClear = () => {
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhoto(null);
    setPhotoPreviewUrl(null);
    setGpsState('idle');
    setGpsCoords(null);
    setLocationSource(null);
    locationRequestRef.current += 1;
    setDescription('');
    setSubmitting(false);
    setSubmitted(false);
    setSubmitResult(null);
    setSubmitError(null);
    onClear?.();
  };

  // Submit form data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !gpsCoords || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('lat', gpsCoords.lat.toString());
      formData.append('lng', gpsCoords.lng.toString());
      formData.append('note', description);

      const result = await submitReport(formData);
      setSubmitResult(result);
      setSubmitted(true);
      setTimeout(() => {
        successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      console.error('Failed to submit report:', err);
      setSubmitError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute GPS box border colour
  const borderColorClass =
    gpsState === 'success' || gpsState === 'manual'
      ? 'border-[#13845f]'
      : gpsState === 'error'
      ? 'border-[#d9951c]'
      : 'border-[#2b4940]';

  // Compute GPS status texts
  let gpsStatusText = 'Waiting for photo capture';
  let gpsSubText = 'Take a photo to automatically get your coordinates.';

  if (gpsState === 'loading') {
    gpsStatusText = 'Getting coordinates...';
    gpsSubText = 'Checking your photo, then your device location.';
  } else if (gpsState === 'success' && gpsCoords) {
    gpsStatusText = `${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lng.toFixed(6)}`;
    gpsSubText =
      locationSource === 'photo'
        ? 'Location read from photo metadata.'
        : `GPS accuracy: approximately ${gpsCoords.accuracy ? Math.round(gpsCoords.accuracy) : 10} m`;
  } else if (gpsState === 'error') {
    gpsStatusText = 'Unable to get GPS';
    gpsSubText = 'Allow location access and try again, or tap the map below.';
  } else if (gpsState === 'manual' && gpsCoords) {
    gpsStatusText = `${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lng.toFixed(6)}`;
    gpsSubText = 'Location set from map';
  }

  const locationSourceLabel =
    locationSource === 'photo'
      ? 'Location from photo'
      : locationSource === 'device'
      ? 'Location from your device'
      : locationSource === 'pin'
      ? 'Location from dropped pin'
      : null;
  const isOutsideTownship =
    gpsCoords !== null &&
    (gpsCoords.lat < TOWNSHIP_BOUNDS.minLat ||
      gpsCoords.lat > TOWNSHIP_BOUNDS.maxLat ||
      gpsCoords.lng < TOWNSHIP_BOUNDS.minLng ||
      gpsCoords.lng > TOWNSHIP_BOUNDS.maxLng);

  return (
    <form onSubmit={handleSubmit}>
      {/* GPS location field */}
      <div className="field flex flex-col gap-[7px] min-w-0 mb-4">
        <label className="text-[#e7f5ef] text-xs font-bold">GPS location</label>
        <div
          className={`gpsbox flex items-center gap-[11px] p-[13px] border rounded-[11px] bg-[#1a332d] ${borderColorClass}`}
        >
          <span className="text-[20px] shrink-0">📍</span>
          <div className="min-w-0 flex-1" aria-live="polite">
            <strong className="block text-xs" id="gpsText">
              {gpsStatusText}
            </strong>
            {locationSourceLabel && (
              <span className="mt-1 inline-block text-[10px] font-bold text-[#20b785]">
                {locationSourceLabel}
              </span>
            )}
            <small className="block mt-1 text-[#a1b9b0] text-[11px] leading-[1.5]">
              {gpsSubText}
            </small>
          </div>
          <button
            type="button"
            className="btn secondary shrink-0 inline-flex items-center justify-center min-h-[36px] px-3 py-2 border border-[#2b4940] rounded-[10px] bg-[#1a332d] text-[#e7f5ef] text-xs font-[750] hover:border-[#13845f] hover:bg-[#203e34] transition whitespace-nowrap cursor-pointer disabled:opacity-50"
            onClick={requestGPS}
            disabled={gpsState === 'loading'}
          >
            {gpsState === 'loading' ? 'Locating...' : 'Get my GPS'}
          </button>
        </div>

        {(gpsCoords || gpsState === 'error') && (
          <div className="mt-2">
            <p className="text-[#a1b9b0] text-[11px] mb-2">
              {gpsCoords
                ? 'Drag the marker to adjust your location, or tap the map to set it:'
                : 'Tap the map to set your location:'}
            </p>
            <ReportMap onLocationSelect={handleMapSelect} selectedLocation={gpsCoords} />
          </div>
        )}
        {isOutsideTownship && (
          <p className="mt-2 rounded-[10px] border border-[#d9951c] bg-[#3d321b] p-2 text-[11px] leading-[1.5] text-[#f4bd50]" role="alert">
            This location is outside the township area. Drag the marker or check the photo.
          </p>
        )}
      </div>

      {/* Photo evidence section */}
      <div className="form-section flex items-center gap-2 mt-[22px] mb-[14px] text-[13px] font-[800]">
        <span>📷</span> Photo evidence
      </div>

      <div className="upload flex flex-col items-center gap-[7px] w-full p-[23px_12px] border-[1.5px] border-dashed border-[#2b4940] rounded-xl bg-[#1a332d] text-center hover:border-[#13845f]">
        <span className="text-[25px]">📸</span>
        <b>Take a photo of the suspected site</b>
        <small className="text-[#a1b9b0] text-[11px]">
          We read the location from your photo when it has one.
        </small>
        <div className="grid grid-cols-2 gap-2 w-full mt-2 max-[380px]:grid-cols-1">
          <button
            type="button"
            aria-label="Take photo"
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 border border-[#13845f] rounded-[10px] bg-[#13845f] text-white text-xs font-[750] hover:bg-[#169a6d] transition cursor-pointer"
          >
            📷 Take photo
          </button>
          <button
            type="button"
            aria-label="Upload photo from gallery"
            onClick={() => galleryInputRef.current?.click()}
            className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 border border-[#2b4940] rounded-[10px] bg-[#1a332d] text-[#e7f5ef] text-xs font-[750] hover:border-[#13845f] hover:bg-[#203e34] transition cursor-pointer"
          >
            🖼️ Upload from gallery
          </button>
        </div>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPhotoSelected}
          aria-label="Take photo"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPhotoSelected}
          aria-label="Upload photo from gallery"
        />
        {photoPreviewUrl && (
          <img
            src={photoPreviewUrl}
            alt="Captured report photo"
            className="w-auto max-w-full max-h-[220px] mt-[10px] rounded-[10px] object-contain"
          />
        )}
      </div>

      {/* Report description section */}
      <div className="form-section flex items-center gap-2 mt-[22px] mb-[14px] text-[13px] font-[800]">
        <span>📝</span> Report description
      </div>

      <div className="field flex flex-col gap-[7px] min-w-0 mb-4">
        <label htmlFor="description" className="text-[#e7f5ef] text-xs font-bold">
          What did you notice? (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Describe the standing water or container..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full min-w-0 min-h-[105px] p-3 border border-[#2b4940] rounded-[10px] outline-none bg-[#0d1e1b] text-[#e7f5ef] text-[13px] resize-y focus:border-[#13845f] focus:shadow-[0_0_0_2px_#13845f22] placeholder:text-[#a1b9b0] placeholder:opacity-80 max-[680px]:text-base"
        />
      </div>

      {/* Safety note */}
      <div className="flex items-start gap-[10px] mt-[10px] p-3 border border-[#2b4940] rounded-[11px] bg-[#1a332d]">
        <span className="shrink-0">🛡️</span>
        <p className="m-0 text-[#a1b9b0] text-[11px] leading-[1.6]">
          Do not touch suspected breeding sites or enter unsafe areas. Only take photos
          from a safe location. Do not photograph people&apos;s faces.
        </p>
      </div>

      {/* Form actions */}
      <div className="grid grid-cols-[1fr_1.5fr] gap-[9px] mt-5 max-[680px]:grid-cols-1">
        <button
          type="button"
          className="btn secondary inline-flex touch-manipulation items-center justify-center gap-[7px] min-h-[44px] p-[11px_9px] border border-[#2b4940] rounded-[10px] bg-[#1a332d] text-[#e7f5ef] text-xs font-[750] hover:border-[#13845f] hover:bg-[#203e34] transition max-[680px]:w-full max-[680px]:min-h-[45px] max-[680px]:text-[13px] max-[680px]:order-2 cursor-pointer"
          onClick={handleClear}
        >
          Clear form
        </button>
        <button
          type="submit"
          disabled={!photo || !gpsCoords || submitting}
          className="btn inline-flex items-center justify-center gap-[7px] min-h-[44px] p-[11px_9px] border border-[#13845f] rounded-[10px] bg-[#13845f] text-white text-xs font-[750] hover:bg-[#169a6d] hover:border-[#169a6d] transition disabled:opacity-50 disabled:cursor-not-allowed max-[680px]:w-full max-[680px]:min-h-[45px] max-[680px]:text-[13px] max-[680px]:order-1 cursor-pointer"
        >
          {submitting ? 'Submitting...' : 'Submit report →'}
        </button>
      </div>

      {submitError && (
        <div className="mt-3 rounded-[10px] border border-[#df4b4b] bg-[#482929] p-[13px] text-xs text-[#ff9999]" role="alert">
          {submitError}
        </div>
      )}

      {/* Success message */}
      {submitted && submitResult && (
        <div
          ref={successRef}
          className="mt-4 p-[13px] border border-[#287854] rounded-[10px] bg-[#163d2d] text-[#8ce2b4] text-xs font-bold leading-[1.6]"
          role="status"
          aria-live="polite"
        >
          ✓ Report submitted successfully!
          <br />
          <span className="mt-1 block font-normal">
            {AI_LABELS[submitResult.ai_check.label]} detected
            {submitResult.ai_check.is_standing_water && (
              <span className="ml-2 inline-flex rounded-full bg-[#1b3d30] px-2 py-1 text-[10px] font-bold text-[#55d7a0]">
                Water visible
              </span>
            )}
            <span className="ml-2">
              · {Math.round(submitResult.ai_check.confidence * 100)}% confidence
            </span>
            {(submitResult.ai_check.label === 'unknown' ||
              submitResult.ai_check.label === 'none') &&
              !submitResult.ai_check.is_standing_water && (
                <span className="mt-1 block font-bold text-[#f4bd50]">Needs review</span>
              )}
          </span>
        </div>
      )}
    </form>
  );
}
