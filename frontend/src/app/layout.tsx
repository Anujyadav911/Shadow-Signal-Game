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
                    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
                        <div className="w-full max-w-md w-full relative z-10">
                            {children}
                        </div>
                    </main>
                </ShadowSocketProvider>
            </body>
        </html>
    );
}
