import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_ORIGIN ?? "http://localhost:3000"),
  title: "커리어핏 | 대학생 맞춤 채용공고",
  description: "대학생의 관심 직무와 역량에 맞는 인턴·신입 채용공고를 추천합니다.",
  openGraph: {
    title: "커리어핏 | 대학생 맞춤 채용공고",
    description: "나에게 맞는 첫 커리어, 헤매지 말고 시작해요.",
    images: [{url:"/og.png",width:1536,height:1024,alt:"커리어핏"}],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "커리어핏 | 대학생 맞춤 채용공고",
    description: "나에게 맞는 첫 커리어, 헤매지 말고 시작해요.",
    images: ["/og.png"],
  },
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ko"><body>{children}</body></html>;
}
