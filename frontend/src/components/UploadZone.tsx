import { UploadCloud, ShieldCheck } from "lucide-react";
import { useState } from "react";

export function UploadZone({
  disabled,
  onVerify
}: {
  disabled: boolean;
  onVerify: (file: File) => Promise<unknown>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectFile = (next: File | null) => {
    if (!next) return;
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setMessage(null);
  };

  return (
    <div
      className="rounded-lg border border-dashed border-cyan-300/40 bg-cyan-300/5 p-4"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        selectFile(event.dataTransfer.files.item(0));
      }}
    >
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg bg-slate-950/40 p-5 text-center transition hover:bg-slate-900/70">
        <UploadCloud className="mb-3 text-arcade-cyan" size={34} />
        <span className="font-bold">Drop proof image or browse</span>
        <span className="mt-1 text-xs text-slate-400">JPEG, PNG, or WebP · verified by Claude 3.5 Sonnet</span>
        <input
          className="hidden"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={disabled}
          onChange={(event) => selectFile(event.target.files?.item(0) ?? null)}
        />
      </label>
      {preview && <img src={preview} alt="Proof preview" className="mt-4 max-h-56 w-full rounded-lg object-cover" />}
      <button
        disabled={!file || disabled}
        onClick={async () => {
          if (!file) return;
          const result = await onVerify(file).catch((error) => {
            setMessage(error instanceof Error ? error.message : "Verification failed");
          });
          if (result && typeof result === "object" && "unlocked" in result && result.unlocked === true) {
            setMessage("Proof accepted. Board unlocked.");
            setFile(null);
            setPreview(null);
          } else if (result) {
            setMessage("Proof rejected. Capture clearer evidence and try again.");
          }
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-pink-400 px-4 py-3 font-black text-slate-950 shadow-neon transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ShieldCheck size={20} />
        Verify Proof
      </button>
      {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
    </div>
  );
}
