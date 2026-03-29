import { Header } from "@/components/header";
import { RoomComponent } from "@/components/room-component";
// import { Auth } from "@/components/auth";
// import LK from "@/components/lk";
import { defaultPresets } from "@/data/presets";
import { Metadata } from "next";

export async function generateMetadata({
                                         searchParams,
                                       }: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  let title = "";
  let description =
      "";

  const presetId = searchParams?.preset;
  if (presetId) {
    const selectedPreset = defaultPresets.find(
        (preset) => preset.id === presetId,
    );
    if (selectedPreset) {
      title = ``;
      description = ``;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://wirtual.dev/",
      images: [
        {
          url: "https://assets.wirtual.dev/wirtual-icon.png",
          width: 1200,
          height: 675,
          type: "image/png",
          alt: title,
        },
      ],
    },
  };
}

export default function Dashboard() {
  return (
      <div className="flex flex-col h-full min-h-screen bg-neutral-100 overflow-hidden max-w-full">
        <header className="flex flex-shrink-0 h-2 items-center justify-between px-4 w-full">
          {/*<LK />*/}
          {/*<Auth />*/}
        </header>
        <main className="flex flex-col flex-grow overflow-hidden p-0 sm:p-2 sm:pt-0 w-full max-w-full relative">
          <Header />
          <RoomComponent />

          {/*/!* WebRTC Client iframe - Centered below instructions *!/*/}
          {/*<div className="w-full flex justify-center mt-4">*/}
          {/*  <div className="w-full max-w-3xl rounded-lg overflow-hidden shadow-md" style={{ height: "450px" }}>*/}
          {/*    <iframe*/}
          {/*        src="https://a2f.carecoach.dev/streaming/webrtc-demo"*/}
          {/*        className="w-full h-full border-0"*/}
          {/*        allow="camera; microphone; display-capture; autoplay; clipboard-write"*/}
          {/*        allowFullScreen*/}
          {/*    ></iframe>*/}
          {/*  </div>*/}
          {/*</div>*/}
        </main>
      </div>
  );
}
