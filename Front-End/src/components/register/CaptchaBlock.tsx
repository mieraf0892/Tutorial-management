"use client";

import { useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Shield } from "lucide-react";

interface CaptchaBlockProps {
  token: string;
  setToken: (val: string) => void;
}

const CaptchaBlock = ({ token, setToken }: CaptchaBlockProps) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const resetCaptcha = () => {
    recaptchaRef.current?.reset();
    setToken("");
  };

  // Only show the notice in production
  if (!import.meta.env.PROD) return null;

  return (
    <div className="py-4">
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
        <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          For security, please complete the CAPTCHA verification. This helps prevent automated registrations.
        </p>
      </div>
      <ReCAPTCHA
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        onChange={(t) => setToken(t || "")}
        ref={recaptchaRef}
        theme="light"
      />
    </div>
  );
};

export default CaptchaBlock;
export { CaptchaBlock };
