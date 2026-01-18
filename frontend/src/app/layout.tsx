import type { Metadata } from 'next';
import { Inter, Outfit, Cinzel } from 'next/font/google';
import './globals.css';
import { ShadowSocketProvider } from '../context/ShadowSocketContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });

export const metadata: Metadata = {
    title: 'Shadow Signal',
    description: 'Realtime Multiplayer Social Deduction Game',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${outfit.variable} ${cinzel.variable} font-sans bg-black text-gray-100 min-h-screen selection:bg-indigo-500/30`}>
                <ShadowSocketProvider>
                    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black p-4 sm:p-6 lg:p-8">
                        <main className="w-full max-w-[600px] flex flex-col items-center gap-6 relative z-10">
                            {children}
                        </main>

                        {/* Global Background Elements or Overlay could go here */}
                    </div>
                </ShadowSocketProvider>
            </body>
        </html>
    );
}
