import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
// Lucide React is used for elegant icons
import { BedDouble, Coffee, ConciergeBell, Package, ChevronRight, ChevronLeft, ChevronDown, Image as ImageIcon, Star, Quote, ChevronUp, MessageSquare, Send, X, Facebook, Instagram, Linkedin, Twitter, Moon, Sun, Droplet } from 'lucide-react';
import { SiGooglemaps } from "react-icons/si";
// Currency formatting utility
import { formatCurrency } from './utils/currency';
import { getApiBaseUrl } from './utils/env';

// Custom hook to detect if an element is in the viewport
const useOnScreen = (ref, rootMargin = "0px") => {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIntersecting(entry.isIntersecting);
            },
            { rootMargin }
        );
        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, rootMargin]);
    return isIntersecting;
};

// Define the themes with a consistent structure for easy switching
const themes = {
    dark: {
        id: 'dark',
        name: 'Dark',
        icon: <Moon className="w-5 h-5" />,
        bgPrimary: "bg-black",
        bgSecondary: "bg-neutral-950",
        bgCard: "bg-white",
        textPrimary: "text-white",
        textSecondary: "text-neutral-400",
        textCardPrimary: "text-neutral-900",
        textCardSecondary: "text-neutral-600",
        textAccent: "text-amber-400",
        textCardAccent: "text-amber-600",
        textTitleGradient: "from-gray-200 via-white to-gray-400",
        border: "border-neutral-700",
        cardBorder: "border-neutral-200",
        borderHover: "hover:border-amber-500/50",
        buttonBg: "bg-amber-500",
        buttonText: "text-neutral-950",
        buttonHover: "hover:bg-amber-400",
        placeholderBg: "bg-neutral-800",
        placeholderText: "text-neutral-400",
        chatBg: "bg-neutral-900",
        chatHeaderBg: "bg-neutral-800",
        chatInputBorder: "border-neutral-700",
        chatInputBg: "bg-neutral-700",
        chatInputPlaceholder: "placeholder-neutral-400",
        chatUserBg: "bg-amber-500",
        chatUserText: "text-neutral-950",
        chatModelBg: "bg-neutral-800",
        chatModelText: "text-neutral-100",
        chatLoaderBg: "bg-neutral-400",
    },
    light: {
        id: 'light',
        name: 'Light',
        icon: <Sun className="w-5 h-5" />,
        bgPrimary: "bg-neutral-50",
        bgSecondary: "bg-neutral-200",
        bgCard: "bg-white",
        textPrimary: "text-neutral-900",
        textSecondary: "text-neutral-600",
        textCardPrimary: "text-neutral-900",
        textCardSecondary: "text-neutral-600",
        textAccent: "text-amber-600",
        textCardAccent: "text-amber-600",
        cardBorder: "border-neutral-300",
        textTitleGradient: "from-amber-600 via-amber-700 to-neutral-900",
        border: "border-neutral-300",
        borderHover: "hover:border-amber-500/50",
        buttonBg: "bg-gradient-to-r from-amber-500 to-amber-600",
        buttonText: "text-white",
        buttonHover: "hover:from-amber-400 hover:to-amber-500",
        placeholderBg: "bg-neutral-100",
        placeholderText: "text-neutral-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-neutral-100",
        chatInputBorder: "border-neutral-200",
        chatInputBg: "bg-neutral-100",
        chatInputPlaceholder: "placeholder-neutral-500",
        chatUserBg: "bg-gradient-to-r from-amber-500 to-amber-600",
        chatUserText: "text-white",
        chatModelBg: "bg-neutral-100",
        chatModelText: "text-neutral-900",
        chatLoaderBg: "bg-neutral-600",
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean',
        icon: <Droplet className="w-5 h-5" />,
        bgPrimary: "bg-slate-50",
        bgSecondary: "bg-slate-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-slate-900",
        textSecondary: "text-slate-600",
        textAccent: "text-teal-600",
        textTitleGradient: "from-teal-700 via-cyan-700 to-blue-800",
        border: "border-slate-300",
        borderHover: "hover:border-teal-500/50",
        buttonBg: "bg-gradient-to-r from-teal-500 to-cyan-600",
        buttonText: "text-white",
        buttonHover: "hover:from-teal-400 hover:to-cyan-500",
        placeholderBg: "bg-slate-100",
        placeholderText: "text-slate-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-slate-100",
        chatInputBorder: "border-slate-200",
        chatInputBg: "bg-slate-100",
        chatInputPlaceholder: "placeholder-slate-500",
        chatUserBg: "bg-gradient-to-r from-teal-500 to-cyan-600",
        chatUserText: "text-white",
        chatModelBg: "bg-slate-100",
        chatModelText: "text-slate-900",
        chatLoaderBg: "bg-slate-600",
    },
    forest: {
        id: 'forest',
        name: 'Forest',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tree-pine"><path d="M17 19h2c.5 0 1-.5 1-1V9c0-2-3-3-3-3H8c-3 0-4 1.5-4 4.5v3.5c0 1.5 1 2 2 2h2"/><path d="M14 15v.5"/><path d="M13 14v.5"/><path d="M12 13v.5"/><path d="M11 12v.5"/><path d="M10 11v.5"/><path d="M9 10v.5"/><path d="M8 9v.5"/><path d="M17 14v.5"/><path d="M16 13v.5"/><path d="M15 12v.5"/><path d="M14 11v.5"/><path d="M13 10v.5"/><path d="M12 9v.5"/><path d="M11 8v.5"/><path d="M10 7v.5"/><path d="M9 6v.5"/><path d="M15 18v1"/><path d="M14 17v1"/><path d="M13 16v1"/><path d="M12 15v1"/><path d="M11 14v1"/><path d="M10 13v1"/><path d="M9 12v1"/><path d="M8 11v1"/><path d="M7 10v1"/><path d="M6 9v1"/><path d="M18 17v1"/><path d="M17 16v1"/><path d="M16 15v1"/><path d="M15 14v1"/><path d="M14 13v1"/><path d="M13 12v1"/><path d="M12 11v1"/><path d="M11 10v1"/><path d="M10 9v1"/><path d="M19 18v1"/><path d="M18 17v1"/><path d="M17 16v1"/><path d="M16 15v1"/><path d="M15 14v1"/><path d="M14 13v1"/><path d="M13 12v1"/><path d="M22 19v2"/><path d="M20 18v1"/><path d="M18 17v1"/><path d="M16 16v1"/><path d="M14 15v1"/><path d="M12 14v1"/><path d="M10 13v1"/><path d="M8 12v1"/><path d="M6 11v1"/><path d="M4 10v1"/><path d="M2 9v1"/><path d="M2 21h20"/><path d="m14 12-2-4-2 4"/><path d="m13 8-1-4-1 4"/><path d="M14 12c.5-1 1.5-2 2.5-3"/><path d="M10 12c-.5-1-1.5-2-2.5-3"/><path d="M12 22v-8"/><path d="m10 16-2 3"/><path d="m14 16 2 3"/></svg>,
        bgPrimary: "bg-green-50",
        bgSecondary: "bg-green-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-green-900",
        textSecondary: "text-green-600",
        textAccent: "text-emerald-600",
        textTitleGradient: "from-emerald-700 via-green-700 to-teal-800",
        border: "border-green-300",
        borderHover: "hover:border-emerald-500/50",
        buttonBg: "bg-gradient-to-r from-emerald-500 to-green-600",
        buttonText: "text-white",
        buttonHover: "hover:from-emerald-400 hover:to-green-500",
        placeholderBg: "bg-green-100",
        placeholderText: "text-green-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-green-100",
        chatInputBorder: "border-green-200",
        chatInputBg: "bg-green-100",
        chatInputPlaceholder: "placeholder-green-500",
        chatUserBg: "bg-gradient-to-r from-emerald-500 to-green-600",
        chatUserText: "text-white",
        chatModelBg: "bg-green-100",
        chatModelText: "text-green-900",
        chatLoaderBg: "bg-green-600",
    },
    rose: {
        id: 'rose',
        name: 'Rose',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flower"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5H12a4.5 4.5 0 1 1-4.5-4.5H12z"/><path d="M12 12a4.5 4.5 0 1 1 4.5 4.5H12a4.5 4.5 0 1 1-4.5-4.5H12z"/><path d="M12 12a4.5 4.5 0 1 1-4.5-4.5H12a4.5 4.5 0 1 1 4.5 4.5H12z"/><path d="M12 12a4.5 4.5 0 1 1 4.5 4.5H12a4.5 4.5 0 1 1-4.5-4.5H12z"/><path d="M7.5 12H12a4.5 4.5 0 0 0 4.5-4.5v-3a4.5 4.5 0 1 1 0 9v3a4.5 4.5 0 1 1 0-9h-4.5a4.5 4.5 0 0 0-4.5 4.5V12z"/></svg>,
        bgPrimary: "bg-pink-50",
        bgSecondary: "bg-pink-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-pink-900",
        textSecondary: "text-pink-600",
        textAccent: "text-rose-600",
        textTitleGradient: "from-rose-700 via-pink-700 to-fuchsia-800",
        border: "border-pink-300",
        borderHover: "hover:border-rose-500/50",
        buttonBg: "bg-gradient-to-r from-rose-500 to-pink-600",
        buttonText: "text-white",
        buttonHover: "hover:from-rose-400 hover:to-pink-500",
        placeholderBg: "bg-pink-100",
        placeholderText: "text-pink-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-pink-100",
        chatInputBorder: "border-pink-200",
        chatInputBg: "bg-pink-100",
        chatInputPlaceholder: "placeholder-pink-500",
        chatUserBg: "bg-gradient-to-r from-rose-500 to-pink-600",
        chatUserText: "text-white",
        chatModelBg: "bg-pink-100",
        chatModelText: "text-pink-900",
        chatLoaderBg: "bg-pink-600",
    },
    slate: {
        id: 'slate',
        name: 'Slate',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/></svg>,
        bgPrimary: "bg-gray-950",
        bgSecondary: "bg-gray-900",
        bgCard: "bg-neutral-50",
        textPrimary: "text-gray-100",
        textSecondary: "text-gray-400",
        textAccent: "text-sky-400",
        textTitleGradient: "from-gray-200 via-gray-400 to-gray-600",
        border: "border-gray-700",
        borderHover: "hover:border-sky-400/50",
        buttonBg: "bg-sky-500",
        buttonText: "text-gray-950",
        buttonHover: "hover:bg-sky-400",
        placeholderBg: "bg-gray-800",
        placeholderText: "text-gray-400",
        chatBg: "bg-gray-900",
        chatHeaderBg: "bg-gray-800",
        chatInputBorder: "border-gray-700",
        chatInputBg: "bg-gray-700",
        chatInputPlaceholder: "placeholder-gray-400",
        chatUserBg: "bg-sky-500",
        chatUserText: "text-gray-950",
        chatModelBg: "bg-gray-800",
        chatModelText: "text-gray-100",
        chatLoaderBg: "bg-gray-400",
    },
    sunrise: {
        id: 'sunrise',
        name: 'Sunrise',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sunrise"><path d="M12 2v2"/><path d="m5 10 1-1"/><path d="m19 10 1-1"/><path d="M12 16a6 6 0 0 0 0 12"/><path d="m3 16 1-1"/><path d="m21 16-1-1"/><path d="m8 20 2-2"/><path d="m16 20-2-2"/></svg>,
        bgPrimary: "bg-orange-50",
        bgSecondary: "bg-yellow-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-orange-900",
        textSecondary: "text-orange-600",
        textAccent: "text-red-500",
        textTitleGradient: "from-orange-500 via-yellow-600 to-red-700",
        border: "border-yellow-200",
        borderHover: "hover:border-red-500/50",
        buttonBg: "bg-red-500",
        buttonText: "text-white",
        buttonHover: "hover:bg-red-400",
        placeholderBg: "bg-yellow-50",
        placeholderText: "text-orange-400",
        chatBg: "bg-white",
        chatHeaderBg: "bg-yellow-100",
        chatInputBorder: "border-yellow-200",
        chatInputBg: "bg-yellow-100",
        chatInputPlaceholder: "placeholder-orange-500",
        chatUserBg: "bg-red-500",
        chatUserText: "text-white",
        chatModelBg: "bg-yellow-100",
        chatModelText: "text-orange-900",
        chatLoaderBg: "bg-red-600",
    },
    lavender: {
        id: 'lavender',
        name: 'Lavender',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lavender"><path d="M14.5 16.5c-2.4-1-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5C3.3 6.7 4 6 5 6c1.1 0 2.4.8 3.5 2.5 1.2 1.9 2 4.2 2.5 5.5.5 1.5 1 3.6 2 4.5 1 .8 2.2 1.3 3.5 1C17.3 17.3 18 16.6 18 15.6c0-1.1-.8-2.4-2.5-3.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5.3-1.3 1-2 2-2 1.1 0 2.4.8 3.5 2.5 1.9 1.2 4.2 2 5.5 2.5 1.5.5 3.6 1 4.5 2 .8 1 1.3 2.2 1 3.5-.3 1.3-1 2-2 2-1.1 0-2.4-.8-3.5-2.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5-.3-1.3-1-2-2-2-1.1 0-2.4-.8-3.5-2.5"/><path d="M12 12c-2.4-1-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5.3-1.3 1-2 2-2 1.1 0 2.4.8 3.5 2.5 1.9 1.2 4.2 2 5.5 2.5 1.5.5 3.6 1 4.5 2 .8 1 1.3 2.2 1 3.5-.3 1.3-1 2-2 2-1.1 0-2.4-.8-3.5-2.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5-.3-1.3-1-2-2-2-1.1 0-2.4-.8-3.5-2.5"/></svg>,
        bgPrimary: "bg-indigo-950",
        bgSecondary: "bg-indigo-900",
        bgCard: "bg-neutral-50",
        textPrimary: "text-indigo-100",
        textSecondary: "text-indigo-300",
        textAccent: "text-violet-400",
        textTitleGradient: "from-indigo-200 via-violet-300 to-purple-400",
        border: "border-indigo-700",
        borderHover: "hover:border-violet-400/50",
        buttonBg: "bg-violet-500",
        buttonText: "text-indigo-950",
        buttonHover: "hover:bg-violet-400",
        placeholderBg: "bg-indigo-800",
        placeholderText: "text-indigo-400",
        chatBg: "bg-indigo-900",
        chatHeaderBg: "bg-indigo-800",
        chatInputBorder: "border-indigo-700",
        chatInputBg: "bg-indigo-700",
        chatInputPlaceholder: "placeholder-indigo-400",
        chatUserBg: "bg-violet-500",
        chatUserText: "text-indigo-950",
        chatModelBg: "bg-indigo-800",
        chatModelText: "text-indigo-100",
        chatLoaderBg: "bg-indigo-400",
    },
    desert: {
        id: 'desert',
        name: 'Desert',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sunrise"><path d="M12 2v2"/><path d="m5 10 1-1"/><path d="m19 10 1-1"/><path d="M12 16a6 6 0 0 0 0 12"/><path d="m3 16 1-1"/><path d="m21 16-1-1"/><path d="m8 20 2-2"/><path d="m16 20-2-2"/></svg>,
        bgPrimary: "bg-stone-100",
        bgSecondary: "bg-stone-200",
        bgCard: "bg-neutral-50",
        textPrimary: "text-stone-900",
        textSecondary: "text-stone-600",
        textAccent: "text-orange-700",
        textTitleGradient: "from-stone-700 via-stone-900 to-amber-900",
        border: "border-stone-300",
        borderHover: "hover:border-orange-700/50",
        buttonBg: "bg-orange-700",
        buttonText: "text-white",
        buttonHover: "hover:bg-orange-600",
        placeholderBg: "bg-stone-50",
        placeholderText: "text-stone-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-stone-100",
        chatInputBorder: "border-stone-200",
        chatInputBg: "bg-stone-100",
        chatInputPlaceholder: "placeholder-stone-500",
        chatUserBg: "bg-orange-700",
        chatUserText: "text-white",
        chatModelBg: "bg-stone-100",
        chatModelText: "text-stone-900",
        chatLoaderBg: "bg-stone-600",
    },
    pomma: {
        id: 'pomma',
        name: 'Pomma',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf"><path d="M2 13c3.5-3.5 12-5 18 0 0 0-4 4-8 8s-8-4-10-6z"/></svg>,
        bgPrimary: "bg-[#f9f4ea]",
        bgSecondary: "bg-[#f1e7d8]",
        bgCard: "bg-white/95",
        textPrimary: "text-[#153a2c]",
        textSecondary: "text-[#4f6f62]",
        textAccent: "text-[#c99c4e]",
        textCardPrimary: "text-[#153a2c]",
        textCardSecondary: "text-[#4f6f62]",
        textCardAccent: "text-[#c99c4e]",
        textTitleGradient: "from-[#184f39] via-[#1f6945] to-[#2c8453]",
        border: "border-[#d6c8ab]",
        cardBorder: "border-[#e2d6c0]",
        borderHover: "hover:border-[#c99c4e]/60",
        buttonBg: "bg-gradient-to-r from-[#0f5132] to-[#1a7042]",
        buttonText: "text-white",
        buttonHover: "hover:from-[#136640] hover:to-[#218051]",
        placeholderBg: "bg-[#f4ebda]",
        placeholderText: "text-[#6e8579]",
        chatBg: "bg-white/90",
        chatHeaderBg: "bg-[#f3e7d2]",
        chatInputBorder: "border-[#d9c9ac]",
        chatInputBg: "bg-[#f7efe0]",
        chatInputPlaceholder: "placeholder-[#6e8579]",
        chatUserBg: "bg-gradient-to-r from-[#0f5132] to-[#1a7042]",
        chatUserText: "text-white",
        chatModelBg: "bg-[#f7efe0]",
        chatModelText: "text-[#153a2c]",
        chatLoaderBg: "bg-[#c99c4e]",
    },
    grape: {
        id: 'grape',
        name: 'Grape',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grape"><path d="M22 6c0 4-4 8-10 8S2 10 2 6"/><path d="M12 14c-6 0-10 4-10 8s4 8 10 8"/><path d="M22 14c-6 0-10 4-10 8s4 8 10 8"/></svg>,
        bgPrimary: "bg-purple-950",
        bgSecondary: "bg-purple-900",
        bgCard: "bg-neutral-50",
        textPrimary: "text-purple-100",
        textSecondary: "text-purple-300",
        textAccent: "text-pink-400",
        textTitleGradient: "from-purple-200 via-pink-300 to-fuchsia-400",
        border: "border-purple-700",
        borderHover: "hover:border-pink-400/50",
        buttonBg: "bg-pink-500",
        buttonText: "text-purple-950",
        buttonHover: "hover:bg-pink-400",
        placeholderBg: "bg-purple-800",
        placeholderText: "text-purple-400",
        chatBg: "bg-purple-900",
        chatHeaderBg: "bg-purple-800",
        chatInputBorder: "border-purple-700",
        chatInputBg: "bg-purple-700",
        chatInputPlaceholder: "placeholder-purple-400",
        chatUserBg: "bg-pink-500",
        chatUserText: "text-purple-950",
        chatModelBg: "bg-purple-800",
        chatModelText: "text-purple-100",
        chatLoaderBg: "bg-purple-400",
    },
    sky: {
        id: 'sky',
        name: 'Sky',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-sun"><path d="M12 2v2"/><path d="m4.9 10 1-1"/><path d="m19.1 10-1-1"/><path d="M14 16a6 6 0 0 0 0 12"/><path d="m3 16 1-1"/><path d="m21 16-1-1"/><path d="m8 20 2-2"/><path d="m16 20-2-2"/></svg>,
        bgPrimary: "bg-sky-50",
        bgSecondary: "bg-sky-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-sky-900",
        textSecondary: "text-sky-600",
        textAccent: "text-blue-500",
        textTitleGradient: "from-sky-700 via-blue-800 to-indigo-900",
        border: "border-sky-300",
        borderHover: "hover:border-blue-500/50",
        buttonBg: "bg-blue-500",
        buttonText: "text-white",
        buttonHover: "hover:bg-blue-400",
        placeholderBg: "bg-sky-50",
        placeholderText: "text-sky-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-sky-100",
        chatInputBorder: "border-sky-200",
        chatInputBg: "bg-sky-100",
        chatInputPlaceholder: "placeholder-sky-500",
        chatUserBg: "bg-blue-500",
        chatUserText: "text-white",
        chatModelBg: "bg-sky-100",
        chatModelText: "text-sky-900",
        chatLoaderBg: "bg-blue-600",
    },
    fire: {
        id: 'fire',
        name: 'Fire',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flame"><path d="M18 10c-1.2-1.2-3-2-5-2-1.2 0-2.8.8-4 2-1.2 1.2-2 3-2 5-2.2 2.2-2.5 4.5-2.5 5.5s.8 1.5 1.5 1.5c.7 0 1.5-.8 1.5-1.5s.3-3.3 2.5-5.5c1.2-1.2 3-2 5-2 1.2 0 2.8.8 4 2 1.2 1.2 2 3 2 5 2.2 2.2 2.5 4.5 2.5 5.5s-.8 1.5-1.5 1.5c-.7 0-1.5-.8-1.5-1.5s-.3-3.3-2.5-5.5z"/></svg>,
        bgPrimary: "bg-red-950",
        bgSecondary: "bg-red-900",
        bgCard: "bg-neutral-50",
        textPrimary: "text-red-100",
        textSecondary: "text-red-300",
        textAccent: "text-orange-400",
        textTitleGradient: "from-orange-200 via-orange-300 to-yellow-400",
        border: "border-red-700",
        borderHover: "hover:border-orange-400/50",
        buttonBg: "bg-orange-500",
        buttonText: "text-red-950",
        buttonHover: "hover:bg-orange-400",
        placeholderBg: "bg-red-800",
        placeholderText: "text-red-400",
        chatBg: "bg-red-900",
        chatHeaderBg: "bg-red-800",
        chatInputBorder: "border-red-700",
        chatInputBg: "bg-red-700",
        chatInputPlaceholder: "placeholder-red-400",
        chatUserBg: "bg-orange-500",
        chatUserText: "text-red-950",
        chatModelBg: "bg-red-800",
        chatModelText: "text-red-100",
        chatLoaderBg: "bg-red-400",
    },
    mint: {
        id: 'mint',
        name: 'Mint',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf"><path d="M2 13c3.5-3.5 12-5 18 0 0 0-4 4-8 8s-8-4-10-6z"/></svg>,
        bgPrimary: "bg-teal-50",
        bgSecondary: "bg-teal-100",
        bgCard: "bg-neutral-50",
        textPrimary: "text-teal-900",
        textSecondary: "text-teal-600",
        textAccent: "text-emerald-600",
        textTitleGradient: "from-teal-700 via-emerald-900 to-green-900",
        border: "border-teal-200",
        borderHover: "hover:border-emerald-600/50",
        buttonBg: "bg-emerald-600",
        buttonText: "text-white",
        buttonHover: "hover:bg-emerald-500",
        placeholderBg: "bg-teal-50",
        placeholderText: "text-teal-500",
        chatBg: "bg-white",
        chatHeaderBg: "bg-teal-100",
        chatInputBorder: "border-teal-200",
        chatInputBg: "bg-teal-100",
        chatInputPlaceholder: "placeholder-teal-500",
        chatUserBg: "bg-emerald-600",
        chatUserText: "text-white",
        chatModelBg: "bg-teal-100",
        chatModelText: "text-teal-900",
        chatLoaderBg: "bg-teal-600",
    },

};

// Background animation component for the floating bubbles
const BackgroundAnimation = ({ theme }) => {
    const bubbles = Array.from({ length: 30 }, (_, i) => { // Reduced bubble count for a smoother, more elegant effect
        const size = `${2 + Math.random() * 4}rem`;
        const animationDelay = `${Math.random() * 20}s`;
        const animationDuration = `${25 + Math.random() * 25}s`; // Longer duration for a calmer float
        const opacity = 0.1 + Math.random() * 0.15; // Reduced max opacity for a more subtle look

        let bubbleColor = "";
        switch (theme.id) {
            case 'dark': bubbleColor = "bg-white/20"; break;
            case 'light': bubbleColor = "bg-neutral-400"; break;
            case 'ocean': bubbleColor = "bg-cyan-400"; break;
            case 'forest': bubbleColor = "bg-lime-400"; break;
            case 'rose': bubbleColor = "bg-fuchsia-400"; break;
            case 'slate': bubbleColor = "bg-sky-400"; break;
            case 'sunrise': bubbleColor = "bg-red-400"; break;
            case 'lavender': bubbleColor = "bg-violet-400"; break;
            case 'desert': bubbleColor = "bg-orange-400"; break;
            case 'grape': bubbleColor = "bg-pink-400"; break;
            case 'sky': bubbleColor = "bg-blue-400"; break;
            case 'fire': bubbleColor = "bg-yellow-400"; break;
            case 'mint': bubbleColor = "bg-emerald-400"; break;
            default: bubbleColor = "bg-neutral-400";
        }
        
        const direction = Math.floor(Math.random() * 4);
        let style = {
            width: size,
            height: size,
            animationDelay,
            animationDuration,
            opacity,
        };
        let animationClass = "";

        switch (direction) {
            case 0: // from bottom to top
                style.bottom = '-10%';
                style.left = `${Math.random() * 100}%`;
                animationClass = 'bubble-up';
                break;
            case 1: // from left to right
                style.left = '-10%';
                style.top = `${Math.random() * 100}%`;
                animationClass = 'bubble-right';
                break;
            case 2: // from top to bottom
                style.top = '-10%';
                style.left = `${Math.random() * 100}%`;
                animationClass = 'bubble-down';
                break;
            case 3: // from right to left
            default:
                style.right = '-10%';
                style.top = `${Math.random() * 100}%`;
                animationClass = 'bubble-left';
                break;
        }

        return (
            <li
                key={i}
                className={`absolute rounded-full list-none block z-0 ${bubbleColor} ${animationClass}`}
                style={style}
            ></li>
        );
    });

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&family=Cinzel:wght@400;500;600;700&display=swap');
                
                * {
                    max-width: 100%;
                }
                
                body, input, button, select, textarea {
                    font-family: "Ubuntu", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                }
                
                html, body {
                    overflow-x: hidden;
                    max-width: 100vw;
                }
                
                * {
                    box-sizing: border-box;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    font-family: "Cinzel", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    max-width: 100%;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                
                section {
                    width: 100%;
                    max-width: 100vw;
                    overflow-x: hidden;
                }
                
                img {
                    max-width: 100%;
                    height: auto;
                }
                
                button, a {
                    touch-action: manipulation;
                }
                
                @media (max-width: 640px) {
                    * {
                        -webkit-tap-highlight-color: transparent;
                    }
                }
                
                .container-custom {
                    max-width: 95%;
                    margin-left: auto;
                    margin-right: auto;
                    padding-left: 1rem;
                    padding-right: 1rem;
                }
                
                @media (min-width: 640px) {
                    .container-custom {
                        max-width: 98%;
                        padding-left: 1.5rem;
                        padding-right: 1.5rem;
                    }
                }
                
                @media (min-width: 1024px) {
                    .container-custom {
                        max-width: 1400px;
                    }
                }
                
                /* Pomma Holidays Premium Styling */
                .luxury-card {
                    border-radius: 1rem;
                    box-shadow: 0 6px 24px -8px rgba(12, 61, 38, 0.25);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .luxury-card:hover {
                    box-shadow: 0 24px 40px -12px rgba(12, 61, 38, 0.35), 0 0 0 1px rgba(201, 156, 78, 0.25);
                    transform: translateY(-4px) scale(1.015);
                }
                
                .premium-gradient {
                    background: linear-gradient(135deg, #0f5132 0%, #1a7042 60%, #218051 100%);
                }
                
                .premium-text-gradient {
                    background: linear-gradient(135deg, #0f5132 0%, #1a7042 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .luxury-overlay {
                    background: linear-gradient(180deg, rgba(12, 61, 38, 0.05) 0%, rgba(12, 61, 38, 0.55) 55%, rgba(15, 49, 38, 0.85) 100%);
                }
                
                .section-badge {
                    display: inline-block;
                    padding: 0.5rem 1.5rem;
                    background: rgba(15, 81, 50, 0.08);
                    color: #0f5132;
                    font-weight: 600;
                    letter-spacing: 0.12em;
                    border-radius: 9999px;
                    border: 1px solid rgba(201, 156, 78, 0.35);
                    backdrop-filter: blur(10px);
                    text-transform: uppercase;
                }
                
                .luxury-shadow {
                    box-shadow: 0 28px 50px -18px rgba(12, 61, 38, 0.28), 0 0 0 1px rgba(201, 156, 78, 0.12);
                }
                
                .card-image {
                    max-height: 200px;
                    object-fit: cover;
                    filter: brightness(1) saturate(1.05);
                    transition: all 0.5s ease;
                }
                
                .luxury-card:hover .card-image {
                    filter: brightness(1.08) saturate(1.2);
                }
                
                .card-title {
                    font-size: 1.125rem;
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                }
                
                .card-description {
                    font-size: 0.875rem;
                    line-height: 1.6;
                    color: #4f6f62;
                }
                
                @keyframes slow-pan { 
                    0% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-3%, 3%) scale(1.05); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Lazy reveal utility - optimized for performance */
                .reveal { opacity: 0; transform: translateY(18px) scale(.98); filter: blur(6px); will-change: opacity, transform, filter; }
                .reveal.in { opacity: 1; transform: none; filter: blur(0); transition: opacity .2s ease, transform .2s ease, filter .2s ease; }
                @keyframes gentle-glow {
                    0%, 100% { filter: brightness(1) drop-shadow(0 0 20px rgba(245, 158, 11, 0.3)); }
                    50% { filter: brightness(1.1) drop-shadow(0 0 30px rgba(245, 158, 11, 0.5)); }
                }
                @keyframes gentle-pulse {
                    0%, 100% { box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3); }
                    50% { box-shadow: 0 15px 60px rgba(245, 158, 11, 0.6); }
                }
                @keyframes bubble-up { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(20px, -25vh) rotate(45deg); } 50% { transform: translate(-20px, -50vh) rotate(90deg); } 75% { transform: translate(20px, -75vh) rotate(135deg); } 100% { transform: translate(0, -110vh) rotate(180deg); } }
                @keyframes bubble-down { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-20px, 25vh) rotate(-45deg); } 50% { transform: translate(20px, 50vh) rotate(-90deg); } 75% { transform: translate(-20px, 75vh) rotate(-135deg); } 100% { transform: translate(0, 110vh) rotate(-180deg); } }
                @keyframes bubble-left { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-25vw, 20px) rotate(45deg); } 50% { transform: translate(-50vw, -20px) rotate(90deg); } 75% { transform: translate(-75vw, 20px) rotate(135deg); } 100% { transform: translate(-110vw, 0) rotate(180deg); } }
                @keyframes bubble-right { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(25vw, -20px) rotate(-45deg); } 50% { transform: translate(50vw, 20px) rotate(-90deg); } 75% { transform: translate(75vw, -20px) rotate(-135deg); } 100% { transform: translate(110vw, 0) rotate(-180deg); } }
                .bubble-up { animation: bubble-up ease-in-out infinite; }
                .bubble-down { animation: bubble-down ease-in-out infinite; }
                .bubble-left { animation: bubble-left ease-in-out infinite; }
                .bubble-right { animation: bubble-right ease-in-out infinite; }
            `}</style>
            <ul className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                {bubbles}
            </ul>
        </>
    );
};

/**
 * A helper function to ensure a URL is valid for an external link.
 * It prepends "https://" if the protocol is missing.
 * @param {string} url The URL to format.
 * @returns {string} A valid, absolute URL.
 */
const formatUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '' || url === '#') {
        return '#'; // Return a safe, non-navigating link if URL is missing
    }
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return trimmedUrl;
    }
    // If it doesn't start with http/https, assume it's a domain and add https://
    return `https://${trimmedUrl}`;
};

export default function App() {
    const [rooms, setRooms] = useState([]);
    const [allRooms, setAllRooms] = useState([]); // Store all rooms for filtering
    const [bookings, setBookings] = useState([]); // Store bookings for availability check
    const [services, setServices] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [foodCategories, setFoodCategories] = useState([]);
    const logoSrc = "/pommaholidays/logo.png";
    const [packages, setPackages] = useState([]);
    const [resortInfo, setResortInfo] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [bannerData, setBannerData] = useState([]);
    const [signatureExperiences, setSignatureExperiences] = useState([]);
    const [planWeddings, setPlanWeddings] = useState([]);
    const [nearbyAttractions, setNearbyAttractions] = useState([]);
    const [nearbyAttractionBanners, setNearbyAttractionBanners] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [currentWeddingIndex, setCurrentWeddingIndex] = useState(0);
    const [currentAttractionBannerIndex, setCurrentAttractionBannerIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [logoError, setLogoError] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        { role: "model", parts: [{ text: "Hello! I am your personal AI Concierge. How can I assist you with your stay at the Elysian Retreat today?" }] }
    ]);
    const [userMessage, setUserMessage] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [showAllRooms, setShowAllRooms] = useState(false);

    // Package image slider state
    const [packageImageIndex, setPackageImageIndex] = useState({});
    // Signature carousel index
    const [signatureIndex, setSignatureIndex] = useState(0);

    // Banner Message State
    const [bannerMessage, setBannerMessage] = useState({ type: null, text: "" });

    // Function to show banner message with auto-dismiss
    const showBannerMessage = (type, text) => {
        setBannerMessage({ type, text });
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setBannerMessage({ type: null, text: "" });
        }, 5000);
    };

    // Booking Modals State
    const [isRoomBookingFormOpen, setIsRoomBookingFormOpen] = useState(false);
    const [isPackageBookingFormOpen, setIsPackageBookingFormOpen] = useState(false);
    const [isPackageSelectionOpen, setIsPackageSelectionOpen] = useState(false);
    const [isPackageDetailsOpen, setIsPackageDetailsOpen] = useState(false);
    const [selectedPackageForDetails, setSelectedPackageForDetails] = useState(null);
    const [isServiceBookingFormOpen, setIsServiceBookingFormOpen] = useState(false);
    const [isFoodOrderFormOpen, setIsFoodOrderFormOpen] = useState(false);
    const [isGeneralBookingOpen, setIsGeneralBookingOpen] = useState(false);
    const [showAmenities, setShowAmenities] = useState(false);
    
    // Detail Dialog State
    const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState(false);
    const [selectedRoomForDetails, setSelectedRoomForDetails] = useState(null);
    const [isServiceDetailsOpen, setIsServiceDetailsOpen] = useState(false);
    const [selectedServiceForDetails, setSelectedServiceForDetails] = useState(null);
    const [isFoodItemDetailsOpen, setIsFoodItemDetailsOpen] = useState(false);
    const [selectedFoodItemForDetails, setSelectedFoodItemForDetails] = useState(null);

    const [bookingData, setBookingData] = useState({
        room_ids: [],
        guest_name: "",
        guest_mobile: "",
        guest_email: "",
        check_in: "",
        check_out: "",
        adults: 1,
        children: 0,
    });
    const [packageBookingData, setPackageBookingData] = useState({
        package_id: null,
        room_ids: [],
        guest_name: "",
        guest_mobile: "",
        guest_email: "",
        check_in: "",
        check_out: "",
        adults: 1,
        children: 0,
    });
    const [serviceBookingData, setServiceBookingData] = useState({
        service_id: null,
        guest_name: "",
        guest_mobile: "",
        guest_email: "",
        room_id: null,
    });
    const [foodOrderData, setFoodOrderData] = useState({
        room_id: null,
        items: {},
    });

    const [bookingMessage, setBookingMessage] = useState({ type: null, text: "" });
    const [isBookingLoading, setIsBookingLoading] = useState(false);

    // Use Pomma Holidays inspired theme palette
    const currentTheme = 'pomma';
    const theme = themes[currentTheme];

    const bannerRef = useRef(null);
    const chatMessagesRef = useRef(null);
    const isBannerVisible = useOnScreen(bannerRef);
    
    const ITEM_PLACEHOLDER = "https://placehold.co/400x300/2d3748/cbd5e0?text=Image+Not+Available";

    // Helper function to get correct image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return ITEM_PLACEHOLDER;
        if (imagePath.startsWith('http')) return imagePath; // Already a full URL
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://www.teqmates.com' 
            : 'http://localhost:8000';
        // Ensure imagePath starts with / for proper URL construction
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${baseUrl}${path}`;
    };

    const activeSignatureExperiences = useMemo(
        () => signatureExperiences.filter(exp => exp.is_active && exp.image_url),
        [signatureExperiences]
    );
    const totalSignatureExperiences = activeSignatureExperiences.length;
    const activeNearbyAttractions = useMemo(
        () => nearbyAttractions.filter(attraction => attraction.is_active),
        [nearbyAttractions]
    );
    const totalNearbyAttractions = activeNearbyAttractions.length;
    const activeNearbyAttractionBanners = useMemo(
        () => nearbyAttractionBanners.filter(banner => banner.is_active),
        [nearbyAttractionBanners]
    );
    const totalNearbyAttractionBanners = activeNearbyAttractionBanners.length;

    const foodItemsByCategory = useMemo(() => {
        if (!foodItems || !foodItems.length) return {};
        return foodItems.reduce((acc, item) => {
            const categoryName = item.category?.name || item.category_name || "Uncategorized";
            if (!acc[categoryName]) acc[categoryName] = [];
            acc[categoryName].push(item);
            return acc;
        }, {});
    }, [foodItems]);
    const categoryNames = useMemo(() => {
        const fromCategories = foodCategories.map(cat => cat.name || "Uncategorized");
        const fromItems = Object.keys(foodItemsByCategory);
        return Array.from(new Set(['All', ...fromCategories, ...fromItems]));
    }, [foodCategories, foodItemsByCategory]);
    const [selectedFoodCategory, setSelectedFoodCategory] = useState('All');
    useEffect(() => {
        if (!categoryNames.length) {
            if (selectedFoodCategory !== 'All') setSelectedFoodCategory('All');
            return;
        }
        if (!categoryNames.includes(selectedFoodCategory)) {
            setSelectedFoodCategory(categoryNames[0]);
        }
    }, [categoryNames, selectedFoodCategory]);
    useEffect(() => {
        if (!categoryNames.includes(selectedFoodCategory)) {
            setSelectedFoodCategory(categoryNames[0] || 'All');
        }
    }, [categoryNames, selectedFoodCategory]);
    const displayedFoodItems = useMemo(() => {
        if (selectedFoodCategory === 'All') return foodItems;
        return foodItemsByCategory[selectedFoodCategory] || [];
    }, [foodItems, foodItemsByCategory, selectedFoodCategory]);

    const goToSignature = useCallback((direction) => {
        setSignatureIndex((prev) => {
            if (!totalSignatureExperiences) return 0;
            return (prev + direction + totalSignatureExperiences) % totalSignatureExperiences;
        });
    }, [totalSignatureExperiences]);

    const getSignatureCardStyle = useCallback((offset) => {
        const abs = Math.abs(offset);
        const horizontalDistance = abs === 1
            ? 'clamp(160px, 24vw, 260px)'
            : 'clamp(260px, 34vw, 380px)';
        const translateX = offset === 0
            ? '0px'
            : offset > 0
                ? horizontalDistance
                : `calc(-1 * ${horizontalDistance})`;
        const translateY = abs === 0
            ? '0px'
            : abs === 1
                ? 'clamp(16px, 4vw, 32px)'
                : 'clamp(28px, 6vw, 52px)';
        const scale = abs === 0 ? 1 : abs === 1 ? 0.9 : 0.78;
        const opacity = abs === 0 ? 1 : abs === 1 ? 0.92 : 0.82;
        const zIndex = abs === 0 ? 50 : abs === 1 ? 40 : 30;
        const boxShadow = abs === 0
            ? '0 25px 45px rgba(12, 61, 38, 0.28)'
            : '0 18px 35px rgba(12, 61, 38, 0.18)';
        const backgroundColor = abs === 0 ? '#ffffff' : 'rgba(255,255,255,0.92)';
        return {
            transform: `translate(-50%, -50%) translate(${translateX}, ${translateY}) scale(${scale})`,
            opacity,
            zIndex,
            boxShadow,
            transition: 'transform 700ms cubic-bezier(.4,0,.2,1), opacity 500ms ease, box-shadow 500ms ease, background-color 500ms ease'
        };
    }, []);

    useEffect(() => {
        if (!totalSignatureExperiences) {
            setSignatureIndex(0);
            return;
        }
        setSignatureIndex(prev => prev % totalSignatureExperiences);
    }, [totalSignatureExperiences]);

    useEffect(() => {
        if (totalSignatureExperiences <= 1) return;
        const timer = setInterval(() => {
            goToSignature(1);
        }, 6000);
        return () => clearInterval(timer);
    }, [totalSignatureExperiences, goToSignature]);

    // Determine gallery card height for a mosaic layout.
    // Specifically, for the SECOND ROW (indices 5-9), apply:
    // [tall, short, tall, tall, short]
    // For other rows, use a gentle alternating pattern for visual rhythm.
    const getGalleryCardHeight = (index) => {
        const columns = 5; // grid is 5 columns on desktop
        const rowIndex = Math.floor(index / columns);
        const colIndex = index % columns;

        // Heights in pixels
        const TALL = 440;
        const SHORT = 280;

        if (rowIndex === 1) {
            const secondRowPattern = [TALL, SHORT, TALL, TALL, SHORT];
            return `${secondRowPattern[colIndex]}px`;
        }

        // Default pattern for other rows (subtle variation)
        const defaultPattern = [320, 360, 300, 360, 320];
        return `${defaultPattern[colIndex]}px`;
    };

    // *** FIX: Added useEffect to fetch all resort data on component mount ***
    useEffect(() => {
        const fetchResortData = async () => {
            const API_BASE_URL = getApiBaseUrl();
            const endpoints = {
                rooms: '/rooms/test',  // Use working test endpoint for real room data
                bookings: '/bookings?limit=500&skip=0', // Reduced limit for better performance - only recent bookings needed
                foodItems: '/food-items/',
                foodCategories: '/food-categories/',
                packages: '/packages/',
                resortInfo: '/resort-info/',
                gallery: '/gallery/',
                reviews: '/reviews/',
                banners: '/header-banner/',
                services: '/services/', // Fetch services (note: plural)
                signatureExperiences: '/signature-experiences/',
                planWeddings: '/plan-weddings/',
                nearbyAttractions: '/nearby-attractions/',
                nearbyAttractionBanners: '/nearby-attraction-banners/'
            };

            try {
                const responses = await Promise.all(
                    Object.values(endpoints).map(endpoint => fetch(`${API_BASE_URL}${endpoint}`))
                );

                for (const res of responses) {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status} for ${res.url}`);
                    }
                }

                const data = await Promise.all(responses.map(res => res.json()));

                const [
                    roomsData, bookingsData, foodItemsData, foodCategoriesData, packagesData,
                    resortInfoData, galleryData, reviewsData, bannerData, servicesData,
                    signatureExperiencesData, planWeddingsData, nearbyAttractionsData, nearbyAttractionBannersData
                ] = data;

                setAllRooms(roomsData);
                // Don't set rooms here - only show after dates are selected
                // setRooms will be set in useEffect when dates are chosen
                setBookings(bookingsData.bookings || []); // Store bookings for availability filtering
                setServices(servicesData || []); // Fetch services from backend
                setFoodItems(foodItemsData);
                setFoodCategories(foodCategoriesData || []);
                setPackages(packagesData);
                setResortInfo(resortInfoData.length > 0 ? resortInfoData[0] : null);
                setGalleryImages(galleryData);
                setReviews(reviewsData);
                setBannerData(bannerData.filter(b => b.is_active));
                setSignatureExperiences(signatureExperiencesData || []);
                setPlanWeddings(planWeddingsData || []);
                setNearbyAttractions(nearbyAttractionsData || []);
                setNearbyAttractionBanners(nearbyAttractionBannersData || []);

            } catch (err) {
                console.error("Failed to fetch resort data:", err);
                setError("Failed to load resort data. Please ensure the backend server is running and accessible.");
            } finally {
                setLoading(false);
            }
        };

        fetchResortData();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Auto-rotate banner images - only if multiple banners
    useEffect(() => {
        if (bannerData.length > 1) {
            const interval = setInterval(() => {
                setCurrentBannerIndex((prev) => (prev + 1) % bannerData.length);
            }, 9000); // Slower transition: change image every 9 seconds
            return () => clearInterval(interval);
        } else if (bannerData.length === 1) {
            setCurrentBannerIndex(0); // Ensure first banner is shown
        }
    }, [bannerData.length]);

    // Auto-change wedding images (optimized with pause on hover)
    const [isWeddingHovered, setIsWeddingHovered] = useState(false);
    const activeWeddings = useMemo(() => planWeddings.filter(w => w.is_active), [planWeddings]);
    useEffect(() => {
        if (activeWeddings.length > 1 && !isWeddingHovered) {
            const interval = setInterval(() => {
                setCurrentWeddingIndex((prev) => (prev + 1) % activeWeddings.length);
            }, 10000); // Change image every 10 seconds
            return () => clearInterval(interval);
        } else if (activeWeddings.length === 1) {
            setCurrentWeddingIndex(0); // Ensure first wedding is shown
        }
    }, [activeWeddings.length, isWeddingHovered]);
    useEffect(() => {
        if (totalNearbyAttractionBanners > 1) {
            const interval = setInterval(() => {
                setCurrentAttractionBannerIndex((prev) => (prev + 1) % totalNearbyAttractionBanners);
            }, 9000);
            return () => clearInterval(interval);
        } else if (totalNearbyAttractionBanners === 1) {
            setCurrentAttractionBannerIndex(0);
        }
    }, [totalNearbyAttractionBanners]);

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    // Handlers for opening booking modals
    const handleOpenRoomBookingForm = (roomId) => {
        setBookingData(prev => ({ ...prev, room_ids: prev.room_ids.includes(roomId) ? prev.room_ids : [...prev.room_ids, roomId] }));
        setIsRoomBookingFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    // Lazy reveal on scroll for elements with .reveal - optimized for performance
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            // Use requestAnimationFrame for smoother updates
            requestAnimationFrame(() => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                        observer.unobserve(entry.target);
                    }
                });
            });
        }, { 
            threshold: 0.1, 
            rootMargin: '50px' // Reduced from 100px for better performance
        });

        const nodes = document.querySelectorAll('.reveal');
        nodes.forEach((n) => observer.observe(n));
        return () => observer.disconnect();
    }, [galleryImages, packages]);

    const handleOpenPackageBookingForm = (packageId) => {
        // Always prioritize dates from bookingData (selected on previous page) over packageBookingData
        const checkIn = (bookingData.check_in && bookingData.check_in.trim() !== '') 
            ? bookingData.check_in 
            : '';
        const checkOut = (bookingData.check_out && bookingData.check_out.trim() !== '') 
            ? bookingData.check_out 
            : '';
        
        // Clear room_ids when opening booking form - they will be auto-selected if full property
        setPackageBookingData(prev => ({
            ...prev, 
            package_id: packageId,
            check_in: checkIn,
            check_out: checkOut,
            room_ids: [] // Clear room selection - will be auto-selected if full property
        }));
        setIsPackageBookingFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    const handleOpenServiceBookingForm = (serviceId) => {
        setServiceBookingData({ ...serviceBookingData, service_id: serviceId });
        setIsServiceBookingFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    const handleOpenFoodOrderForm = () => {
        setIsFoodOrderFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    // Handlers for form changes
    const handleRoomBookingChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => {
            const updated = { ...prev, [name]: value };
            // If check_in is changed and is after check_out, clear check_out
            if (name === 'check_in' && value && prev.check_out && value >= prev.check_out) {
                updated.check_out = '';
            }
            // If check_out is changed and is before check_in, clear check_in
            if (name === 'check_out' && value && prev.check_in && value <= prev.check_in) {
                updated.check_in = '';
            }
            return updated;
        });
    };

    const handleRoomSelection = useCallback((roomId) => {
        setBookingData(prev => {
            const newRoomIds = prev.room_ids.includes(roomId)
                ? prev.room_ids.filter(id => id !== roomId)
                : [...prev.room_ids, roomId];
            return { ...prev, room_ids: newRoomIds };
        });
    }, []);

    const handlePackageBookingChange = (e) => {
        const { name, value } = e.target;
        setPackageBookingData(prev => {
            const updated = { ...prev, [name]: value };
            // If check_in is changed and is after check_out, clear check_out
            if (name === 'check_in' && value && prev.check_out && value >= prev.check_out) {
                updated.check_out = '';
            }
            // If check_out is changed and is before check_in, clear check_in
            if (name === 'check_out' && value && prev.check_in && value <= prev.check_in) {
                updated.check_in = '';
            }
            return updated;
        });
    };

    const handleServiceBookingChange = (e) => {
        const { name, value } = e.target;
        setServiceBookingData(prev => ({ ...prev, [name]: value }));
    };

    const handlePackageRoomSelection = useCallback((roomId) => {
        setPackageBookingData(prev => {
            const newRoomIds = prev.room_ids.includes(roomId)
                ? prev.room_ids.filter(id => id !== roomId)
                : [...prev.room_ids, roomId];
            return { ...prev, room_ids: newRoomIds };
        });
    }, []);

    const handleFoodOrderChange = (e, foodItemId) => {
        const { value } = e.target;
        setFoodOrderData(prev => ({
            ...prev,
            items: {
                ...prev.items,
                [foodItemId]: parseInt(value) || 0,
            }
        }));
    };

    // Check room availability based on selected dates (but always show all rooms)
    const [roomAvailability, setRoomAvailability] = useState({});
    
    // Optimized room availability calculation with useMemo and debouncing
    const roomAvailabilityMemo = useMemo(() => {
        if (!bookingData.check_in || !bookingData.check_out || allRooms.length === 0) {
            return {};
        }
        
        // Calculate availability for each room (memoized for performance)
        const availability = {};
        allRooms.forEach(room => {
                const hasConflict = bookings.some(booking => {
                    const normalizedStatus = booking.status?.toLowerCase().replace(/_/g, '-');
                    if (normalizedStatus === "cancelled" || normalizedStatus === "checked-out") return false;
                    
                    const bookingCheckIn = new Date(booking.check_in);
                    const bookingCheckOut = new Date(booking.check_out);
                const requestedCheckIn = new Date(bookingData.check_in);
                const requestedCheckOut = new Date(bookingData.check_out);
                    
                    const isRoomInBooking = booking.rooms && booking.rooms.some(r => r.id === room.id);
                    if (!isRoomInBooking) return false;
                    
                    return (requestedCheckIn < bookingCheckOut && requestedCheckOut > bookingCheckIn);
                });
                
            availability[room.id] = !hasConflict;
            });
        return availability;
    }, [bookingData.check_in, bookingData.check_out, allRooms, bookings]);
    
    // Update state with debouncing to prevent excessive re-renders
    useEffect(() => {
        const timer = setTimeout(() => {
            setRoomAvailability(roomAvailabilityMemo);
        }, 100); // 100ms debounce
        return () => clearTimeout(timer);
    }, [roomAvailabilityMemo]);

    // Always set rooms to allRooms - availability filtering happens in UI
    useEffect(() => {
        setRooms(allRooms);
    }, [allRooms]);

    // Package booking availability - optimized with useMemo
    const [packageRoomAvailability, setPackageRoomAvailability] = useState({});
    
    const packageRoomAvailabilityMemo = useMemo(() => {
        if (!packageBookingData.check_in || !packageBookingData.check_out || allRooms.length === 0 || !isPackageBookingFormOpen) {
            return {};
        }
        
        // Calculate availability for each room for package booking (memoized for performance)
        const availability = {};
        allRooms.forEach(room => {
                const hasConflict = bookings.some(booking => {
                    const normalizedStatus = booking.status?.toLowerCase().replace(/_/g, '-');
                    if (normalizedStatus === "cancelled" || normalizedStatus === "checked-out") return false;
                    
                    const bookingCheckIn = new Date(booking.check_in);
                    const bookingCheckOut = new Date(booking.check_out);
                    const requestedCheckIn = new Date(packageBookingData.check_in);
                    const requestedCheckOut = new Date(packageBookingData.check_out);
                    
                    const isRoomInBooking = booking.rooms && booking.rooms.some(r => r.id === room.id);
                    if (!isRoomInBooking) return false;
                    
                    return (requestedCheckIn < bookingCheckOut && requestedCheckOut > bookingCheckIn);
                });
                
            availability[room.id] = !hasConflict;
            });
        return availability;
    }, [packageBookingData.check_in, packageBookingData.check_out, allRooms, bookings, isPackageBookingFormOpen]);
    
    // Update state with debouncing to prevent excessive re-renders
    useEffect(() => {
        const timer = setTimeout(() => {
            setPackageRoomAvailability(packageRoomAvailabilityMemo);
        }, 100); // 100ms debounce
        return () => clearTimeout(timer);
    }, [packageRoomAvailabilityMemo]);
    
    // Auto-select all available rooms if package is full property
    useEffect(() => {
        if (!isPackageBookingFormOpen || !packageBookingData.package_id || !packageBookingData.check_in || !packageBookingData.check_out) {
            return;
        }
        
        if (Object.keys(packageRoomAvailabilityMemo).length === 0) {
            return; // Wait for availability to be calculated
        }
        
        const selectedPackage = packages.find(p => p.id === packageBookingData.package_id);
        if (!selectedPackage) return;
        
        const isFullProperty = selectedPackage.is_full_property === true;
        const roomType = selectedPackage.room_type;
        
        if (isFullProperty) {
            // Get all available rooms for full property
            const availableRoomIds = allRooms
                .filter(room => packageRoomAvailabilityMemo[room.id] !== false)
                .map(room => room.id)
                .sort((a, b) => a - b); // Sort for consistency
            
            // Update room_ids using state setter callback to get latest state
            setPackageBookingData(prev => {
                if (availableRoomIds.length > 0) {
                    const currentRoomIds = (prev.room_ids || []).sort((a, b) => a - b);
                    const roomIdsChanged = currentRoomIds.length !== availableRoomIds.length || 
                        !availableRoomIds.every((id, idx) => currentRoomIds[idx] === id);
                    
                    if (roomIdsChanged) {
                        return { ...prev, room_ids: availableRoomIds };
                    }
                } else if (prev.room_ids && prev.room_ids.length > 0) {
                    // No available rooms - clear selection
                    return { ...prev, room_ids: [] };
                }
                return prev; // No change needed
            });
        } else if (roomType) {
            // For room_type packages, filter by room type but don't auto-select
            // Clear selection if current selection includes rooms of wrong type
            setPackageBookingData(prev => {
                const currentRoomIds = prev.room_ids || [];
                if (currentRoomIds.length === 0) return prev; // No selection to validate
                
                const currentRooms = allRooms.filter(room => currentRoomIds.includes(room.id));
                const hasWrongTypeRooms = currentRooms.some(room => 
                    (room.type || "").toLowerCase() !== roomType.toLowerCase()
                );
                
                if (hasWrongTypeRooms) {
                    // Clear selection if it includes rooms of wrong type
                    return { ...prev, room_ids: [] };
                }
                return prev; // No change needed
            });
        }
        // No room_type and not full property - user can select any rooms
        // Don't auto-select, let user choose
    }, [isPackageBookingFormOpen, packageBookingData.package_id, packageBookingData.check_in, packageBookingData.check_out, packageRoomAvailabilityMemo, packages, allRooms]);

    // Handlers for form submissions
    const handleRoomBookingSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isBookingLoading) {
            return;
        }
        
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        if (bookingData.room_ids.length === 0) {
            showBannerMessage("error", "Please select at least one room before booking.");
            setIsBookingLoading(false);
            return;
        }

        // --- MINIMUM BOOKING DURATION VALIDATION ---
        if (bookingData.check_in && bookingData.check_out) {
            const checkInDate = new Date(bookingData.check_in);
            const checkOutDate = new Date(bookingData.check_out);
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            
            if (daysDiff < 1) {
                showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
                setIsBookingLoading(false);
                return;
            }
        }

        // --- CAPACITY VALIDATION ---
        const totalGuests = parseInt(bookingData.adults) + parseInt(bookingData.children);
        const selectedRoomDetails = bookingData.room_ids.map(roomId => rooms.find(r => r.id === roomId)).filter(Boolean);
        const totalCapacity = selectedRoomDetails.reduce((sum, room) => sum + (room.adults || 0) + (room.children || 0), 0);

        if (totalGuests > totalCapacity) {
            showBannerMessage("error", `Guest count (${totalGuests}) exceeds the total capacity (${totalCapacity}) of the selected rooms.`);
            setIsBookingLoading(false);
            return;
        }
        // -------------------------

        try {
            const API_BASE_URL = getApiBaseUrl();
            const response = await fetch(`${API_BASE_URL}/bookings/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                showBannerMessage("success", "Room booking successful! We look forward to your stay.");
                setBookingData({ room_ids: [], guest_name: "", guest_mobile: "", guest_email: "", check_in: "", check_out: "", adults: 1, children: 0 });
                // Close the booking form after successful booking
                setTimeout(() => {
                    setIsRoomBookingFormOpen(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                // Check if it's a validation error from the backend
                if (errorData.detail && errorData.detail.includes("Check-out date must be at least 1 day")) {
                    showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
                } else {
                    showBannerMessage("error", `Booking failed: ${errorData.detail || "An unexpected error occurred."}`);
                }
            }
        } catch (err) {
            console.error("Booking API Error:", err);
            showBannerMessage("error", "An error occurred while booking. Please try again.");
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handlePackageBookingSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isBookingLoading) {
            return;
        }
        
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        // Get the selected package to check if it's full property
        const selectedPackage = packages.find(p => p.id === packageBookingData.package_id);
        const isFullProperty = selectedPackage?.is_full_property === true;
        
        // Only require room selection if not full property
        if (!isFullProperty && packageBookingData.room_ids.length === 0) {
            showBannerMessage("error", "Please select at least one room for the package.");
            setIsBookingLoading(false);
            return;
        }
        
        // For full property, ensure we have available rooms
        if (isFullProperty && (!packageBookingData.room_ids || packageBookingData.room_ids.length === 0)) {
            showBannerMessage("error", "No rooms are available for the selected dates. Please try different dates.");
            setIsBookingLoading(false);
            return;
        }

        // --- MINIMUM BOOKING DURATION VALIDATION ---
        if (packageBookingData.check_in && packageBookingData.check_out) {
            const checkInDate = new Date(packageBookingData.check_in);
            const checkOutDate = new Date(packageBookingData.check_out);
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            
            if (daysDiff < 1) {
                showBannerMessage("error", "Minimum 1 day booking is mandatory. Check-out date must be at least 1 day after check-in date.");
                setIsBookingLoading(false);
                return;
            }
        }

        // --- CAPACITY VALIDATION ---
        const totalGuests = parseInt(packageBookingData.adults) + parseInt(packageBookingData.children);
        const selectedRoomDetails = packageBookingData.room_ids.map(roomId => rooms.find(r => r.id === roomId)).filter(Boolean);
        const totalCapacity = selectedRoomDetails.reduce((sum, room) => sum + (room.adults || 0) + (room.children || 0), 0);

        if (totalGuests > totalCapacity) {
            showBannerMessage("error", `Guest count (${totalGuests}) exceeds the total capacity (${totalCapacity}) of the selected rooms for this package.`);
            setIsBookingLoading(false);
            return;
        }
        // -------------------------

        try {
            const API_BASE_URL = getApiBaseUrl();
            
            // Validate required fields
            if (!packageBookingData.package_id) {
                showBannerMessage("error", "Package ID is missing. Please select a package.");
                setIsBookingLoading(false);
                return;
            }
            
            if (!packageBookingData.check_in || !packageBookingData.check_out) {
                showBannerMessage("error", "Please select check-in and check-out dates.");
                setIsBookingLoading(false);
                return;
            }
            
            if (!packageBookingData.guest_name) {
                showBannerMessage("error", "Please enter your full name.");
                setIsBookingLoading(false);
                return;
            }
            
            // Email and mobile are optional in the schema, but we'll recommend at least one
            if (!packageBookingData.guest_email && !packageBookingData.guest_mobile) {
                showBannerMessage("error", "Please provide at least an email address or mobile number.");
                setIsBookingLoading(false);
                return;
            }
            
            const payload = {
                package_id: parseInt(packageBookingData.package_id),
                room_ids: packageBookingData.room_ids.map(id => parseInt(id)),
                guest_name: packageBookingData.guest_name.trim(),
                guest_email: packageBookingData.guest_email?.trim() || null,
                guest_mobile: packageBookingData.guest_mobile.trim(),
                check_in: packageBookingData.check_in,
                check_out: packageBookingData.check_out,
                adults: parseInt(packageBookingData.adults) || 1,
                children: parseInt(packageBookingData.children) || 0,
            };
            
            console.log("Package Booking Payload:", payload); // Debug log
            
            const response = await fetch(`${API_BASE_URL}/packages/book/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showBannerMessage("success", "Package booking successful! We look forward to your stay.");
                setPackageBookingData({ package_id: null, room_ids: [], guest_name: "", guest_mobile: "", guest_email: "", check_in: "", check_out: "", adults: 1, children: 0 });
                // Close the booking form after successful booking
                setTimeout(() => {
                    setIsPackageBookingFormOpen(false);
                }, 2000);
            } else {
                let errorMessage = "An unexpected error occurred.";
                try {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                        console.error("Package Booking Error Response:", errorData);
                        
                // Check if it's a validation error from the backend
                        if (errorData.detail) {
                            if (typeof errorData.detail === 'string') {
                                errorMessage = errorData.detail;
                            } else if (Array.isArray(errorData.detail)) {
                                // Handle Pydantic validation errors
                                const errors = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
                                errorMessage = `Validation error: ${errors}`;
                } else {
                                errorMessage = JSON.stringify(errorData.detail);
                            }
                        }
                    } else {
                        const textError = await response.text();
                        console.error("Error response text:", textError);
                        errorMessage = textError || `Server error (${response.status}): ${response.statusText}`;
                    }
                } catch (parseError) {
                    console.error("Failed to parse error response:", parseError);
                    errorMessage = `Server error (${response.status}): ${response.statusText}`;
                }
                showBannerMessage("error", `Package booking failed: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Package Booking API Error:", err);
            showBannerMessage("error", `An error occurred while booking the package: ${err.message || "Please check your connection and try again."}`);
        } finally {
            setIsBookingLoading(false);
        }
    };
    
    const handleServiceBookingSubmit = async (e) => {
        e.preventDefault();
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        try {
            const API_BASE_URL = getApiBaseUrl();
            const response = await fetch(`${API_BASE_URL}/services/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceBookingData)
            });

            if (response.ok) {
                showBannerMessage("success", "Service booking successful! Our staff will be with you shortly.");
                setServiceBookingData({ service_id: null, guest_name: "", guest_mobile: "", guest_email: "", room_id: null });
                // Close the booking form after successful booking
                setTimeout(() => {
                    setIsServiceBookingFormOpen(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                showBannerMessage("error", `Service booking failed: ${errorData.detail || "An unexpected error occurred."}`);
            }
        } catch (err) {
            console.error("Service Booking API Error:", err);
            showBannerMessage("error", "An error occurred while booking the service. Please try again.");
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handleFoodOrderSubmit = async (e) => {
        e.preventDefault();
        setIsBookingLoading(true);
        setBookingMessage({ type: null, text: "" });

        const itemsPayload = Object.entries(foodOrderData.items)
                                .filter(([, quantity]) => quantity > 0)
                                .map(([food_item_id, quantity]) => ({ food_item_id: parseInt(food_item_id), quantity }));
        
        if (itemsPayload.length === 0) {
            showBannerMessage("error", "Please select at least one food item.");
            setIsBookingLoading(false);
            return;
        }

        const payload = {
            room_id: foodOrderData.room_id,
            items: itemsPayload,
            amount: 0, // Amount will be calculated by the backend
            assigned_employee_id: 0,
            billing_status: "unbilled"
        };
        
        try {
            const API_BASE_URL = getApiBaseUrl();
            const response = await fetch(`${API_BASE_URL}/food-orders/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showBannerMessage("success", "Food order placed successfully! Your meal will be delivered shortly.");
                setFoodOrderData({ room_id: null, items: {} });
                // Close the booking form after successful order
                setTimeout(() => {
                    setIsFoodOrderFormOpen(false);
                }, 2000);
            } else {
                const errorData = await response.json();
                showBannerMessage("error", `Food order failed: ${errorData.detail || "An unexpected error occurred."}`);
            }
        } catch (err) {
            console.error("Food Order API Error:", err);
            showBannerMessage("error", "An error occurred while placing the food order. Please try again.");
        } finally {
            setIsBookingLoading(false);
        }
    };
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userMessage.trim() || isChatLoading) return;

        const newUserMessage = { role: "user", parts: [{ text: userMessage }] };
        setChatHistory(prev => [...prev, newUserMessage]);
        setUserMessage("");
        setIsChatLoading(true);

        try {
            // Replace with your actual Gemini API key
            const apiKey = "YOUR_GEMINI_API_KEY";
            if (apiKey === "YOUR_GEMINI_API_KEY") {
                 setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "Please replace 'YOUR_GEMINI_API_KEY' with your actual API key in App.js." }] }]);
                 setIsChatLoading(false);
                 return;
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const payload = { contents: [...chatHistory, newUserMessage] };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API call failed: ${response.status}`);

            const result = await response.json();
            const botResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (botResponse) {
                setChatHistory(prev => [...prev, { role: "model", parts: [{ text: botResponse }] }]);
            } else {
                setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "I'm sorry, I couldn't generate a response." }] }]);
            }
        } catch (err) {
            console.error("Gemini API Error:", err);
            setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "I'm having trouble connecting. Please check your API key and network." }] }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        // Apply theme to document body for better visibility
        document.documentElement.className = '';
        document.body.className = `${theme.bgPrimary} ${theme.textPrimary} transition-colors duration-500`;
    }, [theme]);


    // Debounced scroll handler for better performance
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setShowBackToTop(window.scrollY > 300);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const sectionTitleStyle = `text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-6 sm:mb-7 md:mb-8 text-center tracking-tight bg-gradient-to-r ${theme.textTitleGradient} text-transparent bg-clip-text px-2`;
    const cardStyle = `flex-none w-[280px] sm:w-80 md:w-96 ${theme.bgCard} rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out border ${theme.border} ${theme.borderHover} transform group-hover:-translate-y-1 group-hover:shadow-lg`;
    const iconStyle = `w-5 h-5 sm:w-6 sm:h-6 ${theme.textAccent} transition-transform duration-300 group-hover:rotate-12`;
    const textPrimary = theme.textPrimary;
    const textSecondary = theme.textSecondary;
    const priceStyle = `font-bold text-base sm:text-lg md:text-xl ${theme.textAccent} tracking-wider`;
    const buttonStyle = `mt-4 inline-flex items-center text-sm font-semibold ${theme.textAccent} hover:text-white transition duration-300`;

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${theme.bgPrimary} ${theme.textPrimary} relative overflow-hidden`}>
                <style>{`
                    @keyframes logoPulse {
                        0%, 100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.1);
                            opacity: 0.9;
                        }
                    }
                    @keyframes logoFloat {
                        0%, 100% {
                            transform: translateY(0) rotate(0deg);
                        }
                        50% {
                            transform: translateY(-10px) rotate(2deg);
                        }
                    }
                    @keyframes logoGlow {
                        0%, 100% {
                            filter: drop-shadow(0 0 20px rgba(15, 81, 50, 0.3));
                        }
                        50% {
                            filter: drop-shadow(0 0 40px rgba(15, 81, 50, 0.6));
                        }
                    }
                    @keyframes textFade {
                        0%, 100% {
                            opacity: 0.6;
                        }
                        50% {
                            opacity: 1;
                        }
                    }
                    @keyframes shimmer {
                        0% {
                            background-position: -1000px 0;
                        }
                        100% {
                            background-position: 1000px 0;
                        }
                    }
                    .animated-logo {
                        animation: logoFloat 3s ease-in-out infinite, logoPulse 2s ease-in-out infinite, logoGlow 2.5s ease-in-out infinite;
                    }
                    .animated-text {
                        animation: textFade 2s ease-in-out infinite;
                    }
                    .loading-shimmer {
                        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
                        background-size: 1000px 100%;
                        animation: shimmer 2s infinite;
                    }
                `}</style>
                
                {/* Background Gradient Circles */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0f5132]/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c99c4e]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
                
                {/* Main Loading Content */}
                <div className="flex flex-col items-center z-10 relative">
                    {/* Animated Logo */}
                    <div className="relative mb-6 w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center">
                        {/* Outer Glow Effect - Behind everything */}
                        <div className="absolute inset-0 bg-[#0f5132]/30 rounded-full blur-3xl animate-pulse" style={{ zIndex: 1 }}></div>
                        
                        {/* Rotating Rings - Behind white circle */}
                        <div className="absolute inset-0 border-4 border-[#0f5132]/30 rounded-full animate-spin" style={{ animationDuration: '4s', zIndex: 5 }}></div>
                        <div className="absolute inset-2 border-4 border-transparent border-t-[#0f5132] rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse', zIndex: 6 }}></div>
                        <div className="absolute inset-1 border-4 border-transparent border-r-[#c99c4e] rounded-full animate-spin" style={{ animationDuration: '2.5s', zIndex: 6 }}></div>
                        
                        {/* White Background Circle for Logo - On top */}
                        <div className="absolute inset-4 sm:inset-5 md:inset-6 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-[#0f5132]/20" style={{ zIndex: 10 }}>
                            {/* Logo Image or Fallback */}
                            {!logoError ? (
                                <img 
                                    src={logoSrc}
                                    alt="Pomma Holidays Logo"
                                    className="animated-logo w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
                                    onError={() => setLogoError(true)}
                                    style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}
                                />
                            ) : (
                                <div className="animated-logo w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#0f5132] via-[#1a7042] to-[#c99c4e] rounded-full flex items-center justify-center shadow-xl">
                                    <span className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider drop-shadow-lg">PH</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Inner Glow Ring - Around logo inside white circle */}
                        <div className="absolute inset-6 sm:inset-7 md:inset-8 border-2 border-[#0f5132]/30 rounded-full animate-pulse" style={{ zIndex: 15 }}></div>
                    </div>
                    
                    {/* Loading Text */}
                    <div className="text-center">
                        <p className={`animated-text text-lg sm:text-xl md:text-2xl font-semibold ${theme.textPrimary} mb-2`}>
                            Loading resort data...
                        </p>
                        <div className="flex justify-center gap-2 mt-4">
                            <div className="w-2 h-2 bg-[#0f5132] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-[#1a7042] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-[#c99c4e] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>
                
                {/* Shimmer Effect */}
                <div className="loading-shimmer absolute bottom-0 left-0 right-0 h-1"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${theme.bgPrimary} text-red-400`}>
                <p className={`p-4 ${theme.bgCard} rounded-lg shadow-lg`}>{error}</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
              @keyframes auto-scroll-bobbing { 0% { transform: translate(0, 0); } 25% { transform: translate(-12.5%, 3px); } 50% { transform: translate(-25%, 0); } 75% { transform: translate(-37.5%, -3px); } 100% { transform: translate(-50%, 0); } }
              @keyframes auto-scroll-bobbing-reverse { 0% { transform: translate(-50%, 0); } 25% { transform: translate(-37.5%, 3px); } 50% { transform: translate(-25%, 0); } 75% { transform: translate(-12.5%, -3px); } 100% { transform: translate(0, 0); } }
              @keyframes auto-scroll-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
              @keyframes auto-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
              .horizontal-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
              .horizontal-scroll-container::-webkit-scrollbar { display: none; }
              @keyframes bounce-dot { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
              .animate-bounce-dot > div { animation: bounce-dot 1.4s infinite ease-in-out both; }
            `}</style>

            <div className={`relative ${theme.bgPrimary} ${theme.textPrimary} font-sans min-h-screen transition-colors duration-500`}>
                <BackgroundAnimation theme={theme} />
                
                {/* Banner Message - High z-index to appear above all modals and overlays */}
                {bannerMessage.text && (
                    <div 
                        className={`fixed top-0 left-0 right-0 z-[99999] p-4 text-white text-center font-medium shadow-2xl transform transition-all duration-300 ${
                            bannerMessage.type === 'success' ? 'bg-green-600' : 
                            bannerMessage.type === 'error' ? 'bg-red-600' : 
                            bannerMessage.type === 'warning' ? 'bg-yellow-600' : 
                            'bg-blue-600'
                        }`}
                        style={{ 
                            zIndex: 99999,
                            pointerEvents: 'auto'
                        }}
                    >
                        <div className="flex items-center justify-center relative max-w-7xl mx-auto">
                            <span className="mr-2">
                                {bannerMessage.type === 'success' ? '✅' : 
                                 bannerMessage.type === 'error' ? '❌' : 
                                 bannerMessage.type === 'warning' ? '⚠️' : 
                                 'ℹ️'}
                            </span>
                            <span className="flex-1">{bannerMessage.text}</span>
                            <button 
                                onClick={() => setBannerMessage({ type: null, text: "" })}
                                className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                                aria-label="Close message"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
                
                <header className={`fixed left-0 right-0 z-50 bg-[#0f5132]/45 backdrop-blur-xl shadow-md ${bannerMessage.text ? 'top-16 sm:top-16' : 'top-0'} transition-all duration-300`}>
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 h-14 sm:h-16 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2 sm:gap-3 text-white h-full min-w-0 flex-shrink">
                            <img 
                                src={logoSrc} 
                                alt="Pomma Holidays logo" 
                                className="h-10 sm:h-12 md:h-14 w-auto max-w-[150px] sm:max-w-[200px] object-contain"
                                loading="lazy"
                            />
                        </div>
                        <nav className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
                            <button 
                                onClick={() => { setShowAmenities(false); setIsGeneralBookingOpen(true); }} 
                                className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#0f5132] to-[#1a7042] rounded-full shadow-lg hover:from-[#136640] hover:to-[#218051] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c99c4e] whitespace-nowrap min-h-[44px] min-w-[80px]"
                            >
                                Book Now
                            </button>
                        </nav>
                    </div>
                </header>

                <main className="w-full max-w-full pt-0 space-y-0 relative z-10 overflow-hidden">
                  {/* Luxury Hero Banner Section */}
<div
  ref={bannerRef}
  className="relative w-full h-screen overflow-hidden"
>
                {bannerData.length > 0 ? (
                        <>
            {/* Banner Images with Fade Transition and Slow Movement */}
            {bannerData.map((banner, index) => (
                <img
                    key={banner.id}
                    src={getImageUrl(banner.image_url)}
                    onError={(e) => { e.target.src = ITEM_PLACEHOLDER; console.error('Banner image failed to load:', banner.image_url); }}
                    alt={banner.title}
                    className={`absolute inset-0 w-[110%] h-[110%] object-cover object-center transition-all duration-[10000ms] ease-in-out ${index === currentBannerIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} animate-[slow-pan_20s_ease-in-out_infinite]`}
                    style={{
                        animationDelay: `${index * 2}s`,
                        animationDirection: index % 2 === 0 ? 'alternate' : 'alternate-reverse'
                    }}
                />
            ))}

            {/* Luxury Gradient Overlay with Premium Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c3d26]/60 via-[#0f5132]/30 to-transparent flex items-center justify-center text-center px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="relative w-full max-w-5xl py-16 sm:py-20 md:py-24">
                    {bannerData.map((banner, index) => (
                        <div key={banner.id} className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${index === currentBannerIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <div className="mb-3 sm:mb-4 inline-block px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/40 animate-[fadeInUp_1s_ease-out]">
                                <span className="text-white text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.35em] uppercase whitespace-nowrap">
                                    ✦ Nature Meets Luxury ✦
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold tracking-tight leading-[1.1] sm:leading-tight drop-shadow-2xl text-white mb-4 sm:mb-5 md:mb-6 px-2 animate-[fadeInUp_1.2s_ease-out]">
                                <span className="bg-gradient-to-r from-white via-[#f5e6c9] to-white bg-clip-text text-transparent inline-block animate-[gentle-glow_3s_ease-in-out_infinite] break-words">
                                    {banner.title}
                                </span>
                            </h1>
                            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl lg:text-2xl text-[#f5ece0] max-w-4xl mx-auto leading-relaxed drop-shadow-lg px-2 sm:px-4 animate-[fadeInUp_1.4s_ease-out]">
                                {banner.subtitle}
                            </p>
                            <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4 animate-[fadeInUp_1.6s_ease-out]">
                                <button
                                    type="button"
                                    onClick={() => { setShowAmenities(false); setIsGeneralBookingOpen(true); }}
                                    className="group w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-[#0f5132] to-[#1a7042] text-white font-semibold text-sm sm:text-base md:text-lg rounded-full shadow-2xl hover:from-[#136640] hover:to-[#218051] transition-all duration-300 transform hover:scale-105 hover:shadow-[0_20px_45px_rgba(12,61,38,0.45)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d8b471]/60 focus:ring-offset-[#0f5132] animate-[gentle-pulse_2s_ease-in-out_infinite] min-h-[44px]"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Book Your Stay
                                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                                <a href="#packages" className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-sm sm:text-base md:text-lg rounded-full border-2 border-white/40 hover:bg-white/20 transition-all duration-300 text-center min-h-[44px] flex items-center justify-center">
                                    View Packages
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Luxury Navigation Dots - Only show if multiple banners */}
            {bannerData.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
                {bannerData.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentBannerIndex(index)}
                        className={`transition-all duration-300 min-h-[32px] min-w-[32px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center ${
                            index === currentBannerIndex
                                ? "w-10 sm:w-12 h-1 bg-[#d8b471] rounded-full shadow-[0_0_12px_rgba(216,180,113,0.6)]"
                                : "w-6 sm:w-8 h-1 bg-white/40 hover:bg-white/70 rounded-full"
                        }`}
                        aria-label={`Go to banner ${index + 1}`}
                    />
                ))}
            </div>
            )}
        </>
    ) : (
        <div className={`w-full h-full flex items-center justify-center ${theme.placeholderBg} ${theme.placeholderText}`}>
            No banner images available.
        </div>
    )}
</div>

                    {/* Exclusive Deals Section - Pomma Holidays Style */}
                    <section id="packages" className="bg-gradient-to-b from-[#f4ede1] via-[#f9f4ea] to-white py-12 sm:py-16 md:py-20 lg:py-24 transition-colors duration-500">
                        {/* Section Header */}
                        <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 max-w-7xl mb-10 sm:mb-12 md:mb-16">
                            <div className="text-center px-2">
                                <span className="inline-block px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 bg-[#0f5132]/10 text-[#0f5132] text-xs sm:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.35em] uppercase rounded-full border border-[#d8c9ac] mb-3 sm:mb-4">
                                    ✦ Exclusive Deals ✦
                                </span>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#153a2c] mb-3 sm:mb-4 leading-tight px-2">
                                    EXCLUSIVE DEALS FOR MEMORABLE EXPERIENCES
                                </h2>
                            </div>
                        </div>

                        {/* Packages - Mountain Shadows Style */}
                        {packages.length > 0 ? (
                            <div className="space-y-8 sm:space-y-10 md:space-y-12">
                                {/* Featured Large Package - Full Width */}
                                {packages[0] && (() => {
                                    const featuredPkg = packages[0];
                                    const imgIndex = packageImageIndex[featuredPkg.id] || 0;
                                    const currentImage = featuredPkg.images && featuredPkg.images[imgIndex];
                                    return (
                                        <div 
                                            key={featuredPkg.id}
                                            onClick={() => {
                                                setSelectedPackageForDetails(featuredPkg);
                                                setIsPackageDetailsOpen(true);
                                            }}
                                            className={`w-full ${theme.bgCard} rounded-none sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border ${theme.border} transition-all duration-500 hover:shadow-3xl cursor-pointer reveal`}
                                            style={{ transitionDelay: '80ms' }}
                                        >
                                                <div className="flex flex-col lg:flex-row items-stretch h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px]">
                                                    {/* Large Image Section - Left */}
                                                    <div className="w-full lg:w-1/2 h-full overflow-hidden relative">
                                                    <img 
                                                            src={currentImage ? getImageUrl(currentImage.image_url) : ITEM_PLACEHOLDER} 
                                                            alt={featuredPkg.title} 
                                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 reveal" 
                                                            loading="lazy"
                                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                        />
                                                        {/* Price badge - large card */}
                                                        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-[#0f5132]/90 text-white font-extrabold text-lg sm:text-xl md:text-2xl lg:text-3xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-lg border border-white/20 backdrop-blur-sm">
                                                            {formatCurrency(featuredPkg.price || 0)}
                                                        </div>
                                                        {/* Image Slider Dots */}
                                                        {featuredPkg.images && featuredPkg.images.length > 1 && (
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full z-20">
                                                                {featuredPkg.images.map((_, imgIdx) => (
                                                                    <button
                                                                        key={imgIdx}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            e.preventDefault();
                                                                            setPackageImageIndex(prev => ({ ...prev, [featuredPkg.id]: imgIdx }));
                                                                        }}
                                                                        className={`w-2 h-2 rounded-full transition-all min-h-[24px] min-w-[24px] flex items-center justify-center ${imgIdx === imgIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                                                                        aria-label={`View image ${imgIdx + 1}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Content Section - Right */}
                                                    <div className={`w-full lg:w-1/2 p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-center ${theme.bgCard} relative`}>
                                                        <div className="relative z-10">
                                                            <h3 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold ${theme.textPrimary} mb-2 sm:mb-3 leading-tight`}>
                                                                {featuredPkg.title}
                                                            </h3>
                                                            {featuredPkg.duration && (
                                                                <p className={`text-sm sm:text-base md:text-lg ${theme.textSecondary} mb-2 sm:mb-3 font-medium`}>
                                                                    {featuredPkg.duration}
                                                                </p>
                                                            )}
                                                            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-[#0f5132] via-[#1a7042] to-[#c99c4e] mb-3 sm:mb-4"></div>
                                                            <p className={`text-xs sm:text-sm md:text-base ${theme.textSecondary} leading-relaxed mb-4 sm:mb-5 overflow-hidden`} style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                                                {featuredPkg.description}
                                                            </p>
                                                        </div>
                                                        {/* Price Section */}
                                                        <div className="mb-3 sm:mb-4 pt-3 sm:pt-4 border-t border-gray-200">
                                                            <p className={`text-xs sm:text-sm ${theme.textSecondary} mb-1 sm:mb-2`}>Starting from</p>
                                                            <p className={`text-xl sm:text-2xl md:text-3xl font-extrabold ${theme.textAccent}`}>
                                                                {formatCurrency(featuredPkg.price || 0)}
                                                                <span className={`text-sm sm:text-base ${theme.textSecondary} font-normal ml-1 sm:ml-2`}>/package</span>
                                                            </p>
                                                        </div>
                                                        
                                                        {/* Click indicator */}
                                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#0f5132] font-semibold mt-auto">
                                                            <span>Click for full details</span>
                                                            <ChevronRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Smaller Packages Grid - Only show if more than 1 package */}
                                    {packages.length > 1 && (
                                        <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 max-w-7xl">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                                    {packages.slice(1).map((pkg) => {
                                        const imgIndex = packageImageIndex[pkg.id] || 0;
                                        const currentImage = pkg.images && pkg.images[imgIndex];
                                        return (
                                            <div 
                                                key={pkg.id} 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPackageForDetails(pkg);
                                                    setIsPackageDetailsOpen(true);
                                                }}
                                                className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border ${theme.border} cursor-pointer reveal`}
                                                style={{ transitionDelay: `${(imgIndex % 5) * 70}ms` }}
                                            >
                                                        {/* Image Container */}
                                                    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                                                    <img 
                                                                src={currentImage ? getImageUrl(currentImage.image_url) : ITEM_PLACEHOLDER} 
                                                        alt={pkg.title} 
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 reveal" 
                                                        loading="lazy"
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                    />
                                                    {/* Price badge - always visible */}
                                                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-[#0f5132]/90 text-white font-extrabold text-sm sm:text-base md:text-lg px-2 sm:px-3 py-1 rounded-md sm:rounded-lg shadow-md border border-white/20 backdrop-blur-sm">
                                                        {formatCurrency(pkg.price || 0)}
                                                    </div>
                                                    {/* Image Slider Dots */}
                                                    {pkg.images && pkg.images.length > 1 && (
                                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full z-10">
                                                            {pkg.images.map((_, imgIdx) => (
                                                                <button
                                                                    key={imgIdx}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setPackageImageIndex(prev => ({ ...prev, [pkg.id]: imgIdx }));
                                                                    }}
                                                                    className={`w-2 h-2 rounded-full transition-all ${imgIdx === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                        </div>

                                                        {/* Content - Simplified like Mountain Shadows */}
                                                        <div className={`p-4 sm:p-5 md:p-6 ${theme.bgCard}`}>
                                                            <h3 className={`text-lg sm:text-xl md:text-2xl font-extrabold ${theme.textPrimary} mb-2 leading-tight`}>
                                                            {pkg.title}
                                                        </h3>
                                                            {pkg.duration && (
                                                                <p className={`text-sm sm:text-base ${theme.textSecondary} font-medium mb-2`}>
                                                                    {pkg.duration}
                                                        </p>
                                                            )}
                                                            {/* Price */}
                                                            <div className="mb-3 sm:mb-4 pt-2 sm:pt-3 border-t border-gray-200">
                                                                <p className={`text-xs sm:text-sm ${theme.textSecondary} mb-1`}>Starting from</p>
                                                                <p className={`text-xl sm:text-2xl font-extrabold ${theme.textAccent || theme.textPrimary}`}>
                                                                    {formatCurrency(pkg.price || 0)}
                                                                    <span className={`text-xs sm:text-sm ${theme.textSecondary} font-normal`}>/package</span>
                                                                </p>
                                                            </div>
                                                            {/* CTA Row */}
                                                            <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-[#0f5132] font-semibold">
                                                                <span>Click for details</span>
                                                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 max-w-7xl">
                                    <p className={`text-center py-12 ${theme.textSecondary}`}>No packages available at the moment.</p>
                                </div>
                            )}
                    </section>
                    
                    {/* Luxury Villa Showcase Section */}
                    <section id="rooms-section" className="bg-gradient-to-b from-white via-[#f4ede1] to-[#efe1ce] py-20 transition-colors duration-500">
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-white/10 text-white text-sm font-semibold tracking-[0.35em] uppercase rounded-full border border-white mb-4">
                                    ✦ LUXURY ACCOMMODATION ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    Sustainable Luxury Cottages with Unforgettable Views
                                </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Experience the perfect blend of luxury and sustainability in our eco-friendly cottages with panoramic lake and forest views
                                </p>
                            </div>

                            {/* Info Banner - Show when dates not selected */}
                            {(!bookingData.check_in || !bookingData.check_out) && (
                                <div className="mb-8">
                                    <div className={`inline-block w-full p-4 ${theme.bgSecondary} rounded-xl border ${theme.border} shadow-sm`}>
                                        <div className="flex items-center gap-3 justify-center flex-wrap">
                                            <BedDouble className={`w-5 h-5 ${theme.textAccent}`} />
                                            <p className={`text-sm ${theme.textSecondary}`}>
                                                Select check-in and check-out dates above to check room availability for your stay
                                            </p>
                                            <button 
                                                onClick={() => { setShowAmenities(false); setIsGeneralBookingOpen(true); }} 
                                                className={`px-4 py-2 text-xs font-semibold ${theme.buttonBg} ${theme.buttonText} rounded-full shadow hover:shadow-md transition-all duration-300 transform hover:scale-105`}
                                            >
                                                Select Dates
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Availability Info - Show when dates are selected */}
                            {bookingData.check_in && bookingData.check_out && Object.keys(roomAvailability).length > 0 && (
                                <div className="mb-6">
                                    <div className={`inline-block w-full p-3 ${theme.bgCard} rounded-lg border ${theme.border} shadow-sm`}>
                                        <p className={`text-sm ${theme.textPrimary} text-center`}>
                                            Showing availability for <span className="font-semibold">{bookingData.check_in}</span> to <span className="font-semibold">{bookingData.check_out}</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Villa Grid - Always show ALL rooms */}
                            {rooms.length > 0 ? (
                                <>
                                    <div className="mb-4 text-center">
                                        <p className={`text-sm ${theme.textSecondary}`}>
                                            Showing all <span className="font-semibold ${theme.textPrimary}">{rooms.length}</span> rooms
                                        </p>
                                    </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                                        {rooms.map((room, index) => (
                                        <div
                                            key={room.id} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRoomForDetails(room);
                                                setIsRoomDetailsOpen(true);
                                            }}
                                            className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden luxury-shadow transition-all duration-300 transition-all duration-500 transform hover:-translate-y-2 border ${theme.cardBorder || theme.border} cursor-pointer`}
                                        >
                                            {/* Image Container with Overlay */}
                                            <div className="relative h-40 sm:h-44 md:h-48 lg:h-52 overflow-hidden">
                                                <img 
                                                    src={getImageUrl(room.image_url)} 
                                                    alt={room.type} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                    onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                                
                                                {/* Luxury Badge */}
                                                            <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4">
                                                    <span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-[#0f5132] to-[#1a7042] text-white text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] rounded-full shadow-lg whitespace-nowrap">
                                                        Premium Villa
                                                    </span>
                                                </div>

                                                {/* Availability Badge - Only show when dates are selected */}
                                                {bookingData.check_in && bookingData.check_out && (
                                                <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4">
                                                        {roomAvailability[room.id] ? (
                                                            <span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs font-bold shadow-lg bg-green-500 text-white whitespace-nowrap">
                                                                Available
                                                    </span>
                                                        ) : (
                                                            <span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs font-bold shadow-lg bg-red-500 text-white whitespace-nowrap">
                                                                Booked
                                                            </span>
                                                        )}
                                                </div>
                                                )}

                                                {/* Hover Effect Overlay */}
                                                <div className="absolute inset-0 bg-transparent group-hover:bg-[#0f5132]/10 transition-all duration-500" />
                                            </div>

                                            {/* Content */}
                                            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 md:space-y-4">
                                                <h3 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme.textCardPrimary || theme.textPrimary} group-hover:${theme.textCardAccent || theme.textAccent} transition-colors leading-tight`}>
                                                    {room.type}
                                                </h3>
                                                <div className={`flex items-center gap-2 text-xs sm:text-sm ${theme.textCardSecondary || theme.textSecondary}`}>
                                                    <BedDouble className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.textCardAccent || theme.textAccent}`} />
                                                    <span>Room #{room.number}</span>
                                                </div>
                                                
                                                {/* Features */}
                                                <div className={`flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm ${theme.textCardSecondary || theme.textSecondary}`}>
                                                    {(room.features && room.features.length > 0 ? room.features : ["Curated Amenities"])
                                                        .slice(0, 5)
                                                        .map((feature, idx) => (
                                                            <span
                                                                key={`${room.id}-feature-${idx}`}
                                                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold"
                                                            >
                                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                                {feature}
                                                            </span>
                                                        ))}
                                                </div>

                                                {/* Price */}
                                                <div className={`flex items-baseline justify-between pt-2 border-t ${theme.cardBorder || theme.border}`}>
                                                    <div>
                                                        <p className={`text-sm ${theme.textCardSecondary || theme.textSecondary}`}>Starting from</p>
                                                        <p className={`text-3xl font-extrabold ${theme.textCardAccent || theme.textAccent}`}>
                                                            {formatCurrency(room.price)}
                                                            <span className={`text-sm ${theme.textCardSecondary || theme.textSecondary} font-normal`}>/night</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* CTA Button */}
                                                <button 
                                                    onClick={() => handleOpenRoomBookingForm(room.id)} 
                                                    disabled={bookingData.check_in && bookingData.check_out && !roomAvailability[room.id]}
                                                    className={`w-full mt-4 px-6 py-3 font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                                                        bookingData.check_in && bookingData.check_out && !roomAvailability[room.id]
                                                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-50'
                                                            : 'bg-gradient-to-r from-[#0f5132] to-[#1a7042] text-white hover:from-[#136640] hover:to-[#218051] hover:shadow-[0_18px_35px_rgba(12,61,38,0.35)]'
                                                    }`}
                                                >
                                                    {bookingData.check_in && bookingData.check_out && !roomAvailability[room.id] ? 'Not Available' : 'Book Now'}
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <BedDouble className={`w-16 h-16 ${theme.textSecondary} mx-auto mb-4`} />
                                    <p className={`text-lg font-semibold ${theme.textPrimary} mb-2`}>No rooms available</p>
                                    <p className={`${theme.textSecondary}`}>No rooms found in the system.</p>
                                </div>
                            )}

                        </div>
                    </section>

                    {/* Signature Experiences Section - Pomma Rooms Style */}
                    <section className="bg-gradient-to-b from-[#f4ede1] via-[#f9f4ea] to-white py-20 transition-colors duration-500">
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-[#0f5132]/10 text-[#0f5132] text-sm font-semibold tracking-[0.35em] uppercase rounded-full border border-[#d8c9ac] mb-4">
                                    ✦ Signature Experiences ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    SIGNATURE EXPERIENCES AT THE BEST LUXURY RESORT
                                </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Guests can enjoy a range of curated in-house activities designed to explore the region's rich flora and fauna
                                </p>
                            </div>

                            {totalSignatureExperiences > 0 ? (
                                <div className="relative max-w-6xl mx-auto">
                                    {/* Carousel Container */}
                                    <div className="relative h-[400px] sm:h-[460px] lg:h-[520px]">
                                        {[ -2, -1, 0, 1, 2 ].map((offset) => {
                                            if (totalSignatureExperiences === 1 && offset !== 0) return null;
                                            const experience = totalSignatureExperiences
                                                ? activeSignatureExperiences[(signatureIndex + offset + totalSignatureExperiences) % totalSignatureExperiences]
                                                : null;
                                            if (!experience) return null;

                                            const style = getSignatureCardStyle(offset);
                                            const highlights = (experience.description || '')
                                                .split(/[\n•\.]/)
                                                .map(item => item.trim())
                                                .filter(Boolean)
                                                .slice(0, 3);

                                            return (
                                        <div 
                                                    key={`${experience.id}-${offset}`}
                                                        className="absolute top-1/2 left-1/2 w-[72%] sm:w-[60%] lg:w-[50%] max-w-xl transition-all duration-700 ease-[cubic-bezier(.4,.0,.2,1)] will-change-transform"
                                                    style={{
                                                        ...style,
                                                        pointerEvents: offset === 0 ? 'auto' : 'none'
                                                    }}
                                                >
                                                    <div
                                                        className={`relative group h-[400px] sm:h-[460px] lg:h-[520px] rounded-[32px] overflow-hidden bg-black shadow-[0_35px_80px_rgba(12,61,38,0.35)] transition-transform duration-700 ease-[cubic-bezier(.4,.0,.2,1)] will-change-transform ${offset === 0 ? '' : 'scale-[0.9] opacity-70 blur-[1.5px]'}`}
                                                    >
                                                        <img 
                                                            src={getImageUrl(experience.image_url)}
                                                            alt={experience.title}
                                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.12]"
                                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                        />
                                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                                                        <div className="absolute top-6 left-6 z-10">
                                                            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/95 bg-white/20 border border-white/30 rounded-full px-5 py-1.5 shadow-lg backdrop-blur">
                                                                Explore
                                                            </span>
                                                        </div>
                                                        <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-10 pt-16 space-y-6">
                                                            <h3 className="text-3xl sm:text-4xl font-bold text-white leading-tight drop-shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
                                                                {experience.title}
                                                            </h3>
                                                            {highlights.length > 0 && (
                                                                <ul className="space-y-3 text-base text-white/90">
                                                                    {highlights.map((point, idx) => (
                                                                        <li key={idx} className="flex items-start gap-3">
                                                                            <span className="mt-1 inline-flex w-2.5 h-2.5 rounded-full bg-[#c99c4e]" />
                                                                            <span>{point}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        </div>

                                    {/* Carousel Controls */}
                                    {totalSignatureExperiences > 1 && (
                                        <>
                                            <button
                                                onClick={() => goToSignature(-1)}
                                                aria-label="Previous experience"
                                                type="button"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white w-12 h-12 rounded-full shadow-lg border border-[#d6c8ab] flex items-center justify-center hover:scale-105 transition-transform"
                                            >
                                                <ChevronLeft className="w-6 h-6 text-[#0f5132]" />
                                            </button>
                                            <button
                                                onClick={() => goToSignature(1)}
                                                aria-label="Next experience"
                                                type="button"
                                                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white w-12 h-12 rounded-full shadow-lg border border-[#d6c8ab] flex items-center justify-center hover:scale-105 transition-transform"
                                            >
                                                <ChevronRight className="w-6 h-6 text-[#0f5132]" />
                                            </button>
                                        </>
                                    )}

                                    {/* Carousel Indicators */}
                                    {totalSignatureExperiences > 1 && (
                                        <div className="mt-10 flex justify-center gap-2">
                                            {activeSignatureExperiences.map((exp, idx) => (
                                                <button
                                                    key={exp.id}
                                                    onClick={() => setSignatureIndex(idx)}
                                                    type="button"
                                                    className={`w-3 h-3 rounded-full transition-all ${
                                                        idx === signatureIndex
                                                            ? 'bg-[#0f5132]'
                                                            : 'bg-[#c99c4e]/40 hover:bg-[#c99c4e]/70'
                                                    }`}
                                                    aria-label={`Go to experience ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No signature experiences available at the moment.</p>
                            )}
                        </div>
                    </section>

                    {/* Plan Your Wedding Section - Dynamic with Slider */}
                    {planWeddings.length > 0 && planWeddings.some(w => w.is_active) && (
                        <section
                            className="relative w-full h-[600px] md:h-[700px] overflow-hidden"
                            onMouseEnter={() => setIsWeddingHovered(true)}
                            onMouseLeave={() => setIsWeddingHovered(false)}
                        >
                            {planWeddings.filter(w => w.is_active).map((wedding, index) => (
                                <div key={wedding.id}>
                                    {/* Background Images with Animation and Auto-Change */}
                                    <div className="absolute inset-0">
                                        <img 
                                            src={getImageUrl(wedding.image_url)} 
                                            alt={wedding.title} 
                                            className={`absolute inset-0 w-[110%] h-[110%] object-cover object-center transition-all duration-[10000ms] ease-in-out ${index === currentWeddingIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} animate-[slow-pan_20s_ease-in-out_infinite]`}
                                            style={{
                                                animationDelay: `${index * 2}s`,
                                                animationDirection: index % 2 === 0 ? 'alternate' : 'alternate-reverse'
                                            }}
                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }}
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30"></div>
                                    </div>

                                    {/* Content Overlay */}
                                    <div className={`relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-in-out ${index === currentWeddingIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                        <div className="max-w-5xl mx-auto text-center text-white">
                                            {/* Badge */}
                                            <div className="mb-6 inline-block px-6 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/40 animate-[fadeInUp_1s_ease-out]">
                                                <span className="text-[#d8b471] text-sm font-semibold tracking-[0.35em] uppercase">
                                                    ✦ Perfect Venue ✦
                                                </span>
                                            </div>

                        {/* Main Title */}
                                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-6 animate-[fadeInUp_1.2s_ease-out] drop-shadow-2xl leading-tight">
                                                {wedding.title.split(' ').slice(0, 3).join(' ')}<br/>
                                                <span className="bg-gradient-to-r from-white via-[#f5e6c9] to-white bg-clip-text text-transparent">
                                                    {wedding.title.split(' ').slice(3).join(' ') || 'WEDDING DESTINATION'}
                                                </span>
                                            </h2>

                        {/* Description */}
                                            <p className="text-base md:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8 animate-[fadeInUp_1.4s_ease-out] drop-shadow-lg">
                                                {wedding.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Navigation Dots */}
                            {planWeddings.filter(w => w.is_active).length > 1 && (
                                <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                                    {planWeddings.filter(w => w.is_active).map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentWeddingIndex(index)}
                                            className={`transition-all duration-300 ${
                                                index === currentWeddingIndex
                                                    ? "w-12 h-1 bg-[#d8b471] rounded-full shadow-[0_0_12px_rgba(216,180,113,0.6)]"
                                                    : "w-8 h-1 bg-white/40 hover:bg-white/70 rounded-full"
                                            }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Premium Services Showcase Section */}
                    <section className={`${theme.bgCard} py-12 sm:py-16 md:py-20 lg:py-24 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 max-w-7xl">
                            {/* Section Header */}
                            <div className="text-center mb-10 sm:mb-12 md:mb-16 px-2">
                                <span className="inline-block px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 bg-[#0f5132]/10 text-[#0f5132] text-xs sm:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.35em] uppercase rounded-full border border-[#d8c9ac] mb-3 sm:mb-4">
                                    ✦ Premium Services ✦
                                </span>
                                <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold ${theme.textPrimary} mb-3 sm:mb-4 leading-tight px-2`}>
                                    WORLD-CLASS AMENITIES & SERVICES
                                </h2>
                                <p className={`text-base sm:text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed px-2`}>
                                    Experience unparalleled luxury with our comprehensive range of world-class amenities and personalized services
                                </p>
                            </div>

                            {services.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                                    {services.map((service) => (
                                        <div 
                                            key={service.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedServiceForDetails(service);
                                                setIsServiceDetailsOpen(true);
                                            }}
                                            className="relative group overflow-hidden rounded-[26px] bg-white shadow-[0_18px_35px_rgba(12,61,38,0.18)] transition-transform duration-500 hover:-translate-y-3 cursor-pointer"
                                        >
                                            <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                                                {service.images && service.images.length > 0 ? (
                                                    <img
                                                        src={getImageUrl(service.images[0].image_url)}
                                                        alt={service.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0f5132]/15 via-[#1a7042]/15 to-[#c99c4e]/20">
                                                        <ConciergeBell className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#0f5132]" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                                                <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 px-4 sm:px-6 text-white">
                                                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-lg leading-tight">{service.name}</h3>
                                                </div>
                                            </div>
                                            <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                                                <p className="text-xs sm:text-sm text-[#4f6f62] leading-relaxed">
                                                        {service.description}
                                                    </p>
                                                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0f5132] min-h-[44px]">
                                                    <span>Click for details</span>
                                                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                                </div>
                                                </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No services available at the moment.</p>
                            )}
                        </div>
                    </section>

                    {/* Premium Cuisine Section - Mountain Shadows Style */}
                    <section className={`bg-gradient-to-b ${theme.bgCard} ${theme.bgSecondary} py-20 pb-28 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-[#0f5132]/10 text-[#0f5132] text-sm font-semibold tracking-[0.35em] uppercase rounded-full border border-[#d8c9ac] mb-4">
                                    ✦ Savor the Art ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    SAVOR THE ART OF CUISINE
                                </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Experience the art of cuisine at our luxury resort. Enjoy a diverse menu featuring international favorites and authentic local flavors, crafted to delight every palate.
                                </p>
                            </div>

                            {foodItems.length > 0 ? (
                                <>
                                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                                        {categoryNames.map((category) => {
                                            const count = category === 'All'
                                                ? foodItems.length
                                                : (foodItemsByCategory[category]?.length || 0);
                                            return (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    onClick={() => setSelectedFoodCategory(category)}
                                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                                        selectedFoodCategory === category
                                                            ? 'bg-[#0f5132] text-white shadow'
                                                            : 'bg-white text-[#0f5132] border border-[#d8c9ac] hover:bg-[#0f5132]/10'
                                                    }`}
                                                >
                                                    <span>{category}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        selectedFoodCategory === category
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-[#0f5132]/10 text-[#0f5132]'
                                                    }`}>
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {displayedFoodItems.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {displayedFoodItems.map((food) => {
                                                const categoryName = food.category?.name || food.category_name || 'Uncategorized';
                                                return (
                                                    <div 
                                                        key={food.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedFoodItemForDetails(food);
                                                            setIsFoodItemDetailsOpen(true);
                                                        }}
                                                        className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden luxury-shadow transition-all duration-300 transform hover:-translate-y-2 border ${theme.cardBorder || theme.border} cursor-pointer`}
                                                    >
                                                        <div className="relative h-40 overflow-hidden">
                                                            <img 
                                                                src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com/${food.images?.[0]?.image_url}` : `http://localhost:8000/${food.images?.[0]?.image_url}`} 
                                                                alt={food.name} 
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                                onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                            <div className="absolute top-3 left-3 px-3 py-1 bg-black/40 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                                                                {categoryName}
                                                            </div>
                                                            <div className="absolute top-3 right-3">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${food.available ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                                                    {food.available ? "Available" : "Unavailable"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="p-5 space-y-2">
                                                            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0f5132]/70 bg-[#0f5132]/10 px-3 py-1 rounded-full">
                                                                {categoryName}
                                                            </span>
                                                            <h4 className={`text-lg font-semibold ${theme.textCardPrimary || theme.textPrimary}`}>
                                                                {food.name}
                                                            </h4>
                                                            {food.price && (
                                                                <p className="text-sm text-[#1a7042] font-semibold">
                                                                    {formatCurrency(food.price)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-white/60 border border-[#d8c9ac] rounded-2xl">
                                            <p className="text-[#4f6f62] font-medium">
                                                No dishes available under <span className="font-semibold text-[#0f5132]">{selectedFoodCategory}</span> yet.
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No food items available at the moment.</p>
                            )}

                            {/* View More Button */}
                            {foodItems.length > 8 && (
                                <div className="text-center mt-12">
                                    <button className="px-10 py-4 bg-gradient-to-r from-[#0f5132] to-[#1a7042] text-white font-semibold text-lg rounded-full shadow-xl hover:from-[#136640] hover:to-[#218051] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c99c4e]/70">
                                        View Full Menu
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Premium Gallery Section - Mountain Shadows Style */}
                    <section className={`bg-gradient-to-b ${theme.bgCard} ${theme.bgSecondary} py-20 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-[#0f5132]/10 text-[#0f5132] text-sm font-semibold tracking-[0.35em] uppercase rounded-full border border-[#d8c9ac] mb-4">
                                    ✦ Captured Moments ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    EXPLORE THE TIMELESS BEAUTY
                                </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Witness the charm of our resort's stunning views and unforgettable experiences
                                </p>
                            </div>

                            {/* Gallery Grid */}
                            {galleryImages.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-auto gap-4" style={{overflow: 'visible'}}>
                                    {galleryImages.map((image, index) => (
                                        <div 
                                            key={image.id} 
                                            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 reveal"
                                            style={{ height: getGalleryCardHeight(index), transitionDelay: `${(index % 5) * 70}ms` }}
                                        >
                                            <img 
                                                src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com${image.image_url}` : `http://localhost:8000${image.image_url}`} 
                                                alt={image.caption || 'Gallery image'} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                loading="lazy"
                                                onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                            />
                                            
                                            {/* Overlay on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-6">
                                                {image.caption && (
                                                    <p className="text-white text-lg font-semibold drop-shadow-lg">
                                                        {image.caption}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No gallery images available at the moment.</p>
                            )}

                            {/* View More Button removed: grid now wraps into multiple rows automatically */}
                        </div>
                    </section>
                    
                    {/* Nearby Attractions Feature Banner */}
                    {totalNearbyAttractionBanners > 0 && (
                        <section className="relative w-full h-[520px] md:h-[620px] overflow-hidden rounded-3xl mt-20 mb-10 bg-[#0f5132]/5">
                            {activeNearbyAttractionBanners.map((banner, index) => (
                                <div key={banner.id} className="absolute inset-0">
                                    <img
                                        src={getImageUrl(banner.image_url)}
                                        alt={banner.title}
                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-[9000ms] ease-in-out ${index === currentAttractionBannerIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                                        style={{
                                            animationDelay: `${index * 2}s`,
                                            animationDirection: index % 2 === 0 ? 'alternate' : 'alternate-reverse'
                                        }}
                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/20" />
                                </div>
                            ))}
                            {totalNearbyAttractionBanners > 0 && (
                                <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center text-white">
                                    <div className="max-w-4xl mx-auto space-y-6">
                                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/30 uppercase tracking-[0.35em] text-xs font-semibold">
                                            ✦ Nearby Attractions ✦
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight drop-shadow-xl">
                                            {activeNearbyAttractionBanners[currentAttractionBannerIndex]?.title || 'Explore the Destination'}
                                        </h2>
                                        <p className="text-base md:text-xl text-white/85 leading-relaxed drop-shadow-lg">
                                            {activeNearbyAttractionBanners[currentAttractionBannerIndex]?.subtitle || 'Discover the most captivating sights surrounding our resort.'}
                                        </p>
                                        {/* Map button displayed in main Nearby Attractions section */}
                                    </div>
                                </div>
                            )}
                            {totalNearbyAttractionBanners > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                    {activeNearbyAttractionBanners.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentAttractionBannerIndex(index)}
                                            className={`transition-all duration-300 ${
                                                index === currentAttractionBannerIndex
                                                    ? "w-12 h-1 bg-[#d8b471] rounded-full shadow-[0_0_12px_rgba(216,180,113,0.6)]"
                                                    : "w-8 h-1 bg-white/40 hover:bg-white/70 rounded-full"
                                            }`}
                                            aria-label={`Show attraction ${index + 1}`}
                                            type="button"
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Nearby Attractions Section - Mountain Shadows Style */}
                    {nearbyAttractions.length > 0 && nearbyAttractions.some(a => a.is_active) && (
                        <section className={`bg-gradient-to-b ${theme.bgCard} ${theme.bgSecondary} py-20 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                                <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-[#0f5132]/10 text-[#0f5132] text-sm font-semibold tracking-[0.35em] uppercase rounded-full border border-[#d8c9ac] mb-4">
                                    ✦ Explore ✦
                                </span>
                                    <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    NEARBY ATTRACTIONS
                                </h2>
                            </div>

                                {/* Split Layout - Image Left, Text Right or vice versa */}
                                <div className="space-y-12">
                                    {nearbyAttractions.filter(attr => attr.is_active).map((attraction, index) => (
                                    <div 
                                            key={attraction.id} 
                                            className={`${theme.bgCard} rounded-3xl overflow-hidden shadow-2xl border ${theme.border} transition-all duration-500 hover:shadow-3xl`}
                                    >
                                            <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-stretch`}>
                                                {/* Image Section */}
                                                <div className="w-full md:w-1/2 flex items-center justify-center overflow-hidden bg-gray-50">
                                            <img 
                                                        src={getImageUrl(attraction.image_url)} 
                                                        alt={attraction.title} 
                                                        className="w-full h-full object-contain transition-transform duration-700 hover:scale-105" 
                                                onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                            />
                                            </div>
                                                
                                                {/* Content Section */}
                                                <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center ${theme.bgCard}`}>
                                                    <h3 className={`text-3xl md:text-4xl font-extrabold ${theme.textPrimary} mb-4 leading-tight`}>
                                                        {attraction.title}
                                                    </h3>
                                                    <div className="w-20 h-1 bg-gradient-to-r from-[#0f5132] via-[#1a7042] to-[#c99c4e] mb-6"></div>
                                                    <p className={`text-base md:text-lg ${theme.textSecondary} leading-relaxed`}>
                                                        {attraction.description}
                                                    </p>
                                                    {attraction.map_link && (
                                                        <a
                                                            href={formatUrl(attraction.map_link)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-8 inline-flex items-center gap-3 self-start px-6 py-3 bg-[#0f5132] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                                        >
                                                            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#0f5132]">
                                                                <SiGooglemaps className="w-5 h-5" />
                                                            </span>
                                                            <span>Open in Google Maps</span>
                                                        </a>
                                                    )}
                                                </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    )}


                    {/* Reviews Section */}
                    <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
                        <h2 className={`group ${sectionTitleStyle} mb-8 sm:mb-10 md:mb-12`}>
                            <Quote className={`inline-block mr-2 sm:mr-3 mb-1 w-5 h-5 sm:w-6 sm:h-6 ${iconStyle}`} /> What Our Guests Say
                        </h2>
                        <div className="w-full overflow-hidden" >
                           <div className="flex gap-3 sm:gap-4 md:gap-6 animate-[auto-scroll-bobbing-reverse_90s_linear_infinite] hover:[animation-play-state:paused]" >
                                {reviews.length > 0 ? [...reviews, ...reviews].map((review, index) => (
                                    <div key={`${review.id}-${index}`} className={`group flex-none w-[280px] sm:w-80 md:w-96 ${theme.bgCard} rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl border ${theme.border}`} >
                                        <div className="flex justify-center mb-4" >
                                            {[...Array(review.rating)].map((_, i) => <Star key={i} className={`w-5 h-5 fill-current ${theme.textAccent}`} />)}
                                            {[...Array(5 - review.rating)].map((_, i) => <Star key={i + review.rating} className={`${theme.textSecondary} w-5 h-5`} />)}
                                        </div>
                                        <p className={`text-sm italic mb-4 ${textSecondary}`} >{`"${review.comment}"`}</p>
                                        <p className={`font-semibold ${textPrimary}`} >- {review.guest_name}</p>
                                    </div>
                                )) : <p className={`flex-none w-full text-center ${textSecondary}`} >No reviews available.</p>}
                            </div >
                        </div>
                    </section>
                </main>

                {/* Floating UI Elements */}
                <button onClick={scrollToTop} className={`fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 p-2.5 sm:p-3 rounded-full ${theme.buttonBg} ${theme.buttonText} shadow-lg transition-all duration-300 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} min-h-[44px] min-w-[44px] flex items-center justify-center z-40`} aria-label="Back to Top">
                    <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button onClick={toggleChat} className={`fixed bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 p-2.5 sm:p-3 md:p-4 rounded-full ${theme.buttonBg} ${theme.buttonText} shadow-lg transition-all duration-300 z-50 ${theme.buttonHover} min-h-[44px] min-w-[44px] flex items-center justify-center`} aria-label="Open Chat">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* AI Concierge Chat Modal */}
                {isChatOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-end justify-center">
                        <div className={`w-full max-w-lg h-[85vh] sm:h-3/4 md:h-4/5 ${theme.chatBg} rounded-t-2xl sm:rounded-t-3xl shadow-2xl flex flex-col`}>
                            <div className={`${theme.chatHeaderBg} p-3 sm:p-4 rounded-t-2xl sm:rounded-t-3xl flex items-center justify-between border-b ${theme.chatInputBorder} flex-shrink-0`}>
                                <h3 className="text-base sm:text-lg font-bold flex items-center"><MessageSquare className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${theme.textAccent}`} /> AI Concierge</h3>
                                <button onClick={toggleChat} className={`p-1.5 sm:p-2 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center`}><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                            </div>
                            <div ref={chatMessagesRef} className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-2.5 sm:p-3 rounded-xl max-w-[85%] sm:max-w-xs md:max-w-md shadow-lg ${msg.role === 'user' ? `${theme.chatUserBg} ${theme.chatUserText} rounded-br-none` : `${theme.chatModelBg} ${theme.chatModelText} rounded-bl-none`}`}>
                                            <p className="text-xs sm:text-sm break-words">{msg.parts[0].text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className={`p-2.5 sm:p-3 rounded-xl ${theme.chatModelBg} shadow-lg`}>
                                            <div className="flex items-center space-x-2 animate-bounce-dot">
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0s' }}></div>
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0.2s' }}></div>
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleSendMessage} className={`p-3 sm:p-4 border-t ${theme.chatInputBorder} ${theme.chatHeaderBg} flex items-center gap-2 flex-shrink-0`}>
                                <input type="text" value={userMessage} onChange={(e) => setUserMessage(e.target.value)} placeholder="Ask me anything..."
                                    className={`flex-1 p-2.5 sm:p-3 rounded-full ${theme.chatInputBg} ${theme.textPrimary} ${theme.chatInputPlaceholder} focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm sm:text-base min-h-[44px]`} />
                                <button type="submit" className={`p-2.5 sm:p-3 rounded-full ${theme.buttonBg} ${theme.buttonText} ${theme.buttonHover} transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center`} disabled={!userMessage.trim() || isChatLoading}>
                                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                
                {/* General Booking Modal - Date Selection First */}
                {isGeneralBookingOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
                        <div className={`w-full max-w-md ${theme.bgCard} rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}>
                            <div className={`p-4 sm:p-5 md:p-6 flex items-center justify-between border-b ${theme.border} flex-shrink-0`}>
                                <h3 className="text-base sm:text-lg font-bold flex items-center"><BedDouble className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${theme.textAccent}`} /> <span className="whitespace-nowrap">Select Your Dates</span></h3>
                                <button onClick={() => { setIsGeneralBookingOpen(false); setShowAmenities(false); }} className={`p-1.5 sm:p-2 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center`}><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                            </div>
                            <div className="p-4 sm:p-5 md:p-6 space-y-4 overflow-y-auto flex-1">
                                <p className={`${theme.textSecondary} text-center mb-4 text-sm sm:text-base`}>Select your check-in and check-out dates to view available rooms</p>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <div className="space-y-2 w-full sm:w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-in Date</label>
                                        <input 
                                            type="date" 
                                            name="check_in" 
                                            value={bookingData.check_in} 
                                            onChange={handleRoomBookingChange} 
                                            min={new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors text-sm sm:text-base min-h-[44px]`} 
                                        />
                                    </div>
                                    <div className="space-y-2 w-full sm:w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-out Date</label>
                                        <input 
                                            type="date" 
                                            name="check_out" 
                                            value={bookingData.check_out} 
                                            onChange={handleRoomBookingChange} 
                                            min={bookingData.check_in || new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors text-sm sm:text-base min-h-[44px]`} 
                                        />
                                    </div>
                                </div>
                                {bookingData.check_in && bookingData.check_out && (
                                    <div className="pt-4 space-y-3 border-top border-gray-200 dark:border-neutral-700">
                                        <p className={`text-sm ${theme.textSecondary} text-center`}>Continue with booking:</p>
                                        <button 
                                            onClick={() => { setIsGeneralBookingOpen(false); setShowAmenities(false); setIsRoomBookingFormOpen(true); }} 
                                            className={`w-full py-3 sm:py-3.5 rounded-full ${theme.buttonBg} ${theme.buttonText} text-sm sm:text-base font-bold shadow-lg ${theme.buttonHover} transition-colors flex items-center justify-center space-x-2 min-h-[44px]`}
                                        >
                                            <BedDouble className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>Book a Room</span>
                                        </button>
                                        <button 
                                            onClick={() => { 
                                                setIsGeneralBookingOpen(false);
                                                setShowAmenities(false);
                                                setPackageBookingData(prev => ({ 
                                                    ...prev,
                                                    check_in: bookingData.check_in || prev.check_in || '',
                                                    check_out: bookingData.check_out || prev.check_out || ''
                                                }));
                                                setIsPackageSelectionOpen(true); 
                                            }} 
                                            className={`w-full py-3 sm:py-3.5 rounded-full ${theme.buttonBg} ${theme.buttonText} text-sm sm:text-base font-bold shadow-lg ${theme.buttonHover} transition-colors flex items-center justify-center space-x-2 min-h-[44px]`}
                                        >
                                            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>Book a Package</span>
                                        </button>
                                        <button
                                            onClick={() => setShowAmenities(prev => !prev)}
                                            className="w-full py-3 sm:py-3.5 rounded-full bg-white text-[#0f5132] text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-colors flex items-center justify-center space-x-2 border border-[#d8c9ac] min-h-[44px]"
                                        >
                                            <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f5132]" />
                                            <span>{showAmenities ? "Hide Amenities" : "View Amenities"}</span>
                                        </button>
                                    </div>
                                )}
                                {showAmenities && (
                                    <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-neutral-700 pt-4">
                                        <h4 className="text-sm font-semibold text-center text-[#0f5132] uppercase tracking-widest">
                                            Resort Amenities
                                        </h4>
                                        {services && services.length > 0 ? (
                                            <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {services.map((service) => (
                                                    <div
                                                        key={service.id}
                                                        className="flex items-start space-x-3 rounded-2xl bg-white/80 border border-[#d8c9ac] px-4 py-3 shadow-sm"
                                                    >
                                                        <div className="flex-shrink-0 mt-1 text-[#0f5132]">
                                                            <ConciergeBell className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#0f5132]">{service.name}</p>
                                                            {service.description && (
                                                                <p className="text-xs text-[#4f6f62] mt-1 line-clamp-2">
                                                                    {service.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-sm text-[#4f6f62] bg-white/70 rounded-2xl px-4 py-6 border border-dashed border-[#d8c9ac]">
                                                Amenities information will be available soon. Please contact concierge for more details.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Room Booking Modal */}
                {isRoomBookingFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-8`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><BedDouble className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Book a Room</h3>
                                <button onClick={() => setIsRoomBookingFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            {/* Error message inside modal */}
                            {bannerMessage.text && bannerMessage.type === 'error' && (
                                <div className={`mx-6 mt-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm flex items-center`}>
                                    <span className="mr-2">❌</span>
                                    {bannerMessage.text}
                                </div>
                            )}
                            {/* Success message inside modal */}
                            {bannerMessage.text && bannerMessage.type === 'success' && (
                                <div className={`mx-6 mt-4 p-3 rounded-lg bg-green-100 border border-green-300 text-green-700 text-sm flex items-center`}>
                                    <span className="mr-2">✅</span>
                                    {bannerMessage.text}
                                </div>
                            )}
                            <form onSubmit={handleRoomBookingSubmit} className="p-4 space-y-4 overflow-y-auto">
                                {/* Always show editable date inputs */}
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-in Date</label>
                                        <input 
                                            type="date" 
                                            name="check_in" 
                                            value={bookingData.check_in || ''} 
                                            onChange={handleRoomBookingChange} 
                                            min={new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} 
                                        />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-out Date</label>
                                        <input 
                                            type="date" 
                                            name="check_out" 
                                            value={bookingData.check_out || ''} 
                                            onChange={handleRoomBookingChange} 
                                            min={bookingData.check_in || new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Available Rooms for Selected Dates</label>
                                    {!bookingData.check_in || !bookingData.check_out ? (
                                        <div className={`p-6 text-center rounded-xl ${theme.bgSecondary} border-2 border-dashed ${theme.border}`}>
                                            <BedDouble className={`w-10 h-10 ${theme.textSecondary} mx-auto mb-3`} />
                                            <p className={`text-sm ${theme.textSecondary}`}>Please select check-in and check-out dates above to see available rooms</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className={`text-xs ${theme.textSecondary} mb-2`}>Showing rooms available from {bookingData.check_in} to {bookingData.check_out}</p>
                                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-3 rounded-xl ${theme.bgSecondary}`}>
                                                {rooms.length > 0 ? (
                                                    rooms.map(room => (
                                                <div key={room.id} onClick={() => handleRoomSelection(room.id)}
                                                    className={`rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden ${bookingData.room_ids.includes(room.id) ? `${theme.buttonBg} ${theme.buttonText} border-transparent` : `${theme.bgCard} ${theme.textPrimary} ${theme.border} hover:border-[#c99c4e]`}`}
                                                >
                                                    <img 
                                                        src={getImageUrl(room.image_url)} 
                                                        alt={room.type} 
                                                        className="w-full h-20 object-cover" 
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                    />
                                                    <div className="p-2 text-center">
                                                        <p className="font-semibold text-xs">Room {room.number}</p>
                                                        <p className="text-xs opacity-80">{room.type}</p>
                                                        <p className="text-xs opacity-60 mt-1">Max: {room.adults}A, {room.children}C</p>
                                                        <p className="text-xs font-bold mt-1">{formatCurrency(room.price)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-8 text-gray-500">
                                                        <BedDouble className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                        <p className="text-sm font-semibold mb-1">No rooms available</p>
                                                        <p className="text-xs">No rooms are available for the selected dates. Please try different dates.</p>
                                            </div>
                                        )}
                                    </div>
                                        </>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Full Name</label>
                                    <input type="text" name="guest_name" value={bookingData.guest_name} onChange={handleRoomBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={bookingData.guest_email} onChange={handleRoomBookingChange} placeholder="user@example.com" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={bookingData.guest_mobile} onChange={handleRoomBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Adults</label>
                                        <input type="number" name="adults" value={bookingData.adults} onChange={handleRoomBookingChange} min="1" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Children</label>
                                        <input type="number" name="children" value={bookingData.children} onChange={handleRoomBookingChange} min="0" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* Package Booking Modal */}
                {isPackageBookingFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-8`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><Package className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Book a Package</h3>
                                <button onClick={() => setIsPackageBookingFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            {/* Error message inside modal */}
                            {bannerMessage.text && bannerMessage.type === 'error' && (
                                <div className={`mx-6 mt-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm flex items-center`}>
                                    <span className="mr-2">❌</span>
                                    {bannerMessage.text}
                                </div>
                            )}
                            {/* Success message inside modal */}
                            {bannerMessage.text && bannerMessage.type === 'success' && (
                                <div className={`mx-6 mt-4 p-3 rounded-lg bg-green-100 border border-green-300 text-green-700 text-sm flex items-center`}>
                                    <span className="mr-2">✅</span>
                                    {bannerMessage.text}
                                </div>
                            )}
                            <form onSubmit={handlePackageBookingSubmit} className="p-4 space-y-4 overflow-y-auto">
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Package ID</label>
                                    <input type="number" name="package_id" value={packageBookingData.package_id || ''} readOnly className={`w-full p-3 rounded-xl ${theme.placeholderBg} ${theme.placeholderText} focus:outline-none`} />
                                </div>
                                {/* Always show editable date inputs */}
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-in Date</label>
                                        <input 
                                            type="date" 
                                            name="check_in" 
                                            value={packageBookingData.check_in || ''} 
                                            onChange={handlePackageBookingChange} 
                                            min={new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} 
                                        />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-out Date</label>
                                        <input 
                                            type="date" 
                                            name="check_out" 
                                            value={packageBookingData.check_out || ''} 
                                            onChange={handlePackageBookingChange} 
                                            min={packageBookingData.check_in || new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} 
                                        />
                                    </div>
                                </div>
                                {/* Room Selection - Only show if not full property */}
                                {(() => {
                                    const selectedPackage = packages.find(p => p.id === packageBookingData.package_id);
                                    const isFullProperty = selectedPackage?.is_full_property === true;
                                    const roomType = selectedPackage?.room_type;
                                    
                                    // Filter rooms by room_type if specified
                                    const filteredRooms = rooms.filter(room => {
                                        if (isFullProperty) return true; // Show all rooms for full property (for display only)
                                        if (roomType) {
                                            return (room.type || "").toLowerCase() === roomType.toLowerCase();
                                        }
                                        return true; // Show all rooms if no room_type specified
                                    });
                                    
                                    if (isFullProperty) {
                                        // Full Property - No room selection needed
                                        const availableRoomsCount = filteredRooms.filter(room => packageRoomAvailability[room.id] !== false).length;
                                        const totalRoomsCount = filteredRooms.length;
                                        
                                        return (
                                            <div className="space-y-2">
                                                <label className={`block text-sm font-medium ${theme.textSecondary}`}>Property Type</label>
                                                <div className={`p-4 sm:p-5 md:p-6 text-center rounded-xl ${theme.bgSecondary} border-2 border-[#0f5132] bg-[#0f5132]/10`}>
                                                    <Package className={`w-10 h-10 sm:w-12 sm:h-12 ${theme.textAccent} mx-auto mb-3`} />
                                                    <p className={`text-base sm:text-lg font-semibold ${theme.textPrimary} mb-2`}>Full Property Package</p>
                                                    <p className={`text-sm sm:text-base ${theme.textSecondary} mb-3`}>
                                                        This package includes the entire property. All available rooms will be automatically booked for your selected dates.
                                                    </p>
                                                    {packageBookingData.check_in && packageBookingData.check_out && (
                                                        <div className="mt-4 pt-4 border-t border-gray-300">
                                                            <p className={`text-xs sm:text-sm ${theme.textPrimary} font-semibold mb-1`}>
                                                                {availableRoomsCount} of {totalRoomsCount} rooms available
                                                            </p>
                                                            <p className={`text-xs ${theme.textSecondary}`}>
                                                                All available rooms will be included in your booking
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // Room Type or No Type - Show room selection
                                    return (
                                        <div className="space-y-2">
                                            <label className={`block text-sm font-medium ${theme.textSecondary}`}>
                                                {roomType ? `Available ${roomType} Rooms for Selected Dates` : 'Available Rooms for Selected Dates'}
                                            </label>
                                            {!packageBookingData.check_in || !packageBookingData.check_out ? (
                                                <div className={`p-4 sm:p-5 md:p-6 text-center rounded-xl ${theme.bgSecondary} border-2 border-dashed ${theme.border}`}>
                                                    <BedDouble className={`w-10 h-10 ${theme.textSecondary} mx-auto mb-3`} />
                                                    <p className={`text-sm ${theme.textSecondary}`}>Please select check-in and check-out dates above to see available rooms</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className={`text-xs ${theme.textSecondary} mb-2`}>
                                                        {roomType 
                                                            ? `Showing ${roomType} rooms available from ${packageBookingData.check_in} to ${packageBookingData.check_out}` 
                                                            : `Showing rooms available from ${packageBookingData.check_in} to ${packageBookingData.check_out}`
                                                        }
                                                    </p>
                                                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-3 rounded-xl ${theme.bgSecondary}`}>
                                                        {filteredRooms.length > 0 ? (
                                                            filteredRooms.map(room => {
                                                                const isAvailable = Object.keys(packageRoomAvailability).length === 0 || packageRoomAvailability[room.id] !== false;
                                                                return (
                                                                    <div 
                                                                        key={room.id} 
                                                                        onClick={() => isAvailable && handlePackageRoomSelection(room.id)}
                                                                        className={`rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                                                                            !isAvailable 
                                                                                ? 'opacity-50 cursor-not-allowed bg-gray-300 border-gray-400' 
                                                                                : `cursor-pointer ${packageBookingData.room_ids.includes(room.id) ? `${theme.buttonBg} ${theme.buttonText} border-transparent` : `${theme.bgCard} ${theme.textPrimary} ${theme.border} hover:border-[#c99c4e]`}`
                                                                        }`}
                                                                    >
                                                                        <img 
                                                                            src={getImageUrl(room.image_url)} 
                                                                            alt={room.type} 
                                                                            className="w-full h-20 object-cover" 
                                                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                                        />
                                                                        <div className="p-2 text-center">
                                                                            <p className="font-semibold text-xs">Room {room.number}</p>
                                                                            <p className="text-xs opacity-80">{room.type}</p>
                                                                            <p className="text-xs opacity-60 mt-1">Max: {room.adults}A, {room.children}C</p>
                                                                            <p className="text-xs font-bold mt-1">{formatCurrency(room.price)}</p>
                                                                            {!isAvailable && (
                                                                                <p className="text-xs text-red-600 font-bold mt-1">Unavailable</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="col-span-full text-center py-8 text-gray-500">
                                                                <BedDouble className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                                <p className="text-sm font-semibold mb-1">
                                                                    {roomType ? `No ${roomType} rooms available` : 'No rooms available'}
                                                                </p>
                                                                <p className="text-xs">
                                                                    {roomType ? `No ${roomType} rooms are available for the selected dates. Please try different dates.` : 'No rooms are available for the selected dates. Please try different dates.'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })()}
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Full Name</label>
                                    <input type="text" name="guest_name" value={packageBookingData.guest_name} onChange={handlePackageBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={packageBookingData.guest_email || ''} onChange={handlePackageBookingChange} placeholder="user@example.com (optional)" className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={packageBookingData.guest_mobile} onChange={handlePackageBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Adults</label>
                                        <input type="number" name="adults" value={packageBookingData.adults} onChange={handlePackageBookingChange} min="1" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Children</label>
                                        <input type="number" name="children" value={packageBookingData.children} onChange={handlePackageBookingChange} min="0" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                    </div>
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* Package Details Dialog */}
                {isPackageDetailsOpen && selectedPackageForDetails && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
                        <div className={`w-full max-w-5xl ${theme.bgCard} rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-4 sm:my-8`}>
                            {/* Header */}
                            <div className={`p-4 sm:p-5 md:p-6 flex items-center justify-between border-b ${theme.border} flex-shrink-0`}>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center">
                                    <Package className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 ${theme.textAccent}`} />
                                    <span className="whitespace-nowrap">{selectedPackageForDetails.title}</span>
                                </h3>
                                <button 
                                    onClick={() => setIsPackageDetailsOpen(false)} 
                                    className={`p-1.5 sm:p-2 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center`}
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
                                {/* Image Gallery */}
                                {selectedPackageForDetails.images && selectedPackageForDetails.images.length > 0 && (() => {
                                    const detailImgIndex = packageImageIndex[selectedPackageForDetails.id] || 0;
                                    const detailCurrentImage = selectedPackageForDetails.images[detailImgIndex];
                                    return (
                                        <>
                                            <div className="mb-6">
                                                <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden mb-4">
                                                    <img 
                                                        src={getImageUrl(detailCurrentImage.image_url)} 
                                                        alt={selectedPackageForDetails.title} 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }}
                                                        loading="lazy"
                                                    />
                                                    {/* Image Navigation Dots */}
                                                    {selectedPackageForDetails.images.length > 1 && (
                                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full z-10">
                                                            {selectedPackageForDetails.images.map((_, imgIdx) => (
                                                                <button
                                                                    key={imgIdx}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setPackageImageIndex(prev => ({ ...prev, [selectedPackageForDetails.id]: imgIdx }));
                                                                    }}
                                                                    className={`w-2 h-2 rounded-full transition-all min-h-[24px] min-w-[24px] flex items-center justify-center ${
                                                                        imgIdx === detailImgIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Thumbnail Gallery */}
                                            {selectedPackageForDetails.images.length > 1 && (
                                                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                                                    {selectedPackageForDetails.images.map((img, imgIdx) => (
                                                        <button
                                                            key={imgIdx}
                                                            onClick={() => setPackageImageIndex(prev => ({ ...prev, [selectedPackageForDetails.id]: imgIdx }))}
                                                            className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border-2 transition-all ${
                                                                imgIdx === detailImgIndex ? 'border-[#0f5132] ring-2 ring-[#0f5132]/50' : 'border-transparent hover:border-[#0f5132]/50'
                                                            }`}
                                                        >
                                                            <img 
                                                                src={getImageUrl(img.image_url)} 
                                                                alt={`${selectedPackageForDetails.title} ${imgIdx + 1}`} 
                                                                className="w-full h-full object-cover" 
                                                                onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                                
                                {/* Package Details */}
                                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                                    {/* Title and Duration */}
                                    <div>
                                        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${theme.textPrimary} mb-2 sm:mb-3 leading-tight`}>
                                            {selectedPackageForDetails.title}
                                        </h2>
                                        {selectedPackageForDetails.duration && (
                                            <p className={`text-base sm:text-lg md:text-xl ${theme.textSecondary} font-medium mb-3 sm:mb-4`}>
                                                {selectedPackageForDetails.duration}
                                            </p>
                                        )}
                                        <div className="w-20 sm:w-24 md:w-28 h-1 sm:h-1.5 bg-gradient-to-r from-[#0f5132] via-[#1a7042] to-[#c99c4e] mb-4 sm:mb-5"></div>
                                    </div>
                                    
                                    {/* Description */}
                                    <div>
                                        <h3 className={`text-lg sm:text-xl font-semibold ${theme.textPrimary} mb-2 sm:mb-3`}>Description</h3>
                                        <p className={`text-sm sm:text-base md:text-lg ${theme.textSecondary} leading-relaxed whitespace-pre-line`}>
                                            {selectedPackageForDetails.description}
                                        </p>
                                    </div>
                                    
                                    {/* Price */}
                                    <div className="pt-4 sm:pt-5 border-t border-gray-200">
                                        <p className={`text-sm sm:text-base ${theme.textSecondary} mb-2 sm:mb-3`}>Starting from</p>
                                        <p className={`text-3xl sm:text-4xl md:text-5xl font-extrabold ${theme.textAccent}`}>
                                            {formatCurrency(selectedPackageForDetails.price || 0)}
                                            <span className={`text-base sm:text-lg md:text-xl ${theme.textSecondary} font-normal ml-2 sm:ml-3`}>/package</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Footer with Book Now Button */}
                            <div className={`p-4 sm:p-5 md:p-6 border-t ${theme.border} flex-shrink-0 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between`}>
                                <div className="flex-1">
                                    <p className={`text-xs sm:text-sm ${theme.textSecondary}`}>
                                        Ready to book this package?
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsPackageDetailsOpen(false);
                                        handleOpenPackageBookingForm(selectedPackageForDetails.id);
                                    }}
                                    className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-[#0f5132] to-[#1a7042] text-white text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-xl hover:from-[#136640] hover:to-[#218051] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c99c4e]/70 min-h-[44px] sm:min-h-[52px] md:min-h-[56px]"
                                >
                                    Book Now
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Room Details Dialog */}
                {isRoomDetailsOpen && selectedRoomForDetails && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
                        <div className={`w-full max-w-5xl ${theme.bgCard} rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-4 sm:my-8`}>
                            {/* Header */}
                            <div className={`p-4 sm:p-5 md:p-6 flex items-center justify-between border-b ${theme.border} flex-shrink-0`}>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center">
                                    <BedDouble className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 ${theme.textAccent}`} />
                                    <span className="whitespace-nowrap">Room {selectedRoomForDetails.number || selectedRoomForDetails.id} - {selectedRoomForDetails.type}</span>
                                </h3>
                                <button 
                                    onClick={() => setIsRoomDetailsOpen(false)} 
                                    className={`p-1.5 sm:p-2 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center`}
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
                                {/* Image */}
                                {selectedRoomForDetails.image_url ? (
                                    <div className="mb-6">
                                        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden mb-4">
                                            <img 
                                                src={getImageUrl(selectedRoomForDetails.image_url)} 
                                                alt={selectedRoomForDetails.type} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }}
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-[#0f5132]/15 via-[#1a7042]/15 to-[#c99c4e]/20 flex items-center justify-center">
                                            <BedDouble className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-[#0f5132]" />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Room Details */}
                                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                                    {/* Title */}
                                    <div>
                                        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${theme.textPrimary} mb-2 sm:mb-3 leading-tight`}>
                                            Room {selectedRoomForDetails.number || selectedRoomForDetails.id} - {selectedRoomForDetails.type}
                                        </h2>
                                        <div className="w-20 sm:w-24 md:w-28 h-1 sm:h-1.5 bg-gradient-to-r from-[#0f5132] via-[#1a7042] to-[#c99c4e] mb-4 sm:mb-5"></div>
                                    </div>
                                    
                                    {/* Features */}
                                    {selectedRoomForDetails.features && selectedRoomForDetails.features.length > 0 && (
                                        <div>
                                            <h3 className={`text-lg sm:text-xl font-semibold ${theme.textPrimary} mb-2 sm:mb-3`}>Features & Amenities</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                                                {selectedRoomForDetails.features.map((feature, idx) => (
                                                    <div key={idx} className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg ${theme.bgSecondary} border ${theme.border}`}>
                                                        <div className={`w-2 h-2 rounded-full ${theme.textAccent} bg-current`}></div>
                                                        <span className={`text-sm sm:text-base ${theme.textSecondary}`}>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Capacity */}
                                    <div className="pt-4 sm:pt-5 border-t border-gray-200">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className={`text-sm sm:text-base ${theme.textSecondary} mb-1`}>Adults</p>
                                                <p className={`text-2xl sm:text-3xl font-extrabold ${theme.textAccent}`}>
                                                    {selectedRoomForDetails.adults || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={`text-sm sm:text-base ${theme.textSecondary} mb-1`}>Children</p>
                                                <p className={`text-2xl sm:text-3xl font-extrabold ${theme.textAccent}`}>
                                                    {selectedRoomForDetails.children || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Price */}
                                    {selectedRoomForDetails.price && (
                                        <div className="pt-4 sm:pt-5 border-t border-gray-200">
                                            <p className={`text-sm sm:text-base ${theme.textSecondary} mb-2 sm:mb-3`}>Price per night</p>
                                            <p className={`text-3xl sm:text-4xl md:text-5xl font-extrabold ${theme.textAccent}`}>
                                                {formatCurrency(selectedRoomForDetails.price)}
                                                <span className={`text-base sm:text-lg md:text-xl ${theme.textSecondary} font-normal ml-2 sm:ml-3`}>/night</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Footer with Book Now Button */}
                            <div className={`p-4 sm:p-5 md:p-6 border-t ${theme.border} flex-shrink-0 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between`}>
                                <div className="flex-1">
                                    <p className={`text-xs sm:text-sm ${theme.textSecondary}`}>
                                        Ready to book this room?
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsRoomDetailsOpen(false);
                                        handleRoomSelection(selectedRoomForDetails.id);
                                        setIsGeneralBookingOpen(true);
                                    }}
                                    className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-[#0f5132] to-[#1a7042] text-white text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-xl hover:from-[#136640] hover:to-[#218051] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c99c4e]/70 min-h-[44px] sm:min-h-[52px] md:min-h-[56px]"
                                >
                                    Book Now
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Service Details Dialog */}
                {isServiceDetailsOpen && selectedServiceForDetails && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
                        <div className={`w-full max-w-5xl ${theme.bgCard} rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-4 sm:my-8`}>
                            {/* Header */}
                            <div className={`p-4 sm:p-5 md:p-6 flex items-center justify-between border-b ${theme.border} flex-shrink-0`}>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center">
                                    <ConciergeBell className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 ${theme.textAccent}`} />
                                    <span className="whitespace-nowrap">{selectedServiceForDetails.name}</span>
                                </h3>
                                <button 
                                    onClick={() => setIsServiceDetailsOpen(false)} 
                                    className={`p-1.5 sm:p-2 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center`}
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
                                {/* Image */}
                                {selectedServiceForDetails.images && selectedServiceForDetails.images.length > 0 && (
                                    <div className="mb-6">
                                        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden mb-4">
                                            <img 
                                                src={getImageUrl(selectedServiceForDetails.images[0].image_url)} 
                                                alt={selectedServiceForDetails.name} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }}
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Service Details */}
                                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                                    {/* Title */}
                                    <div>
                                        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${theme.textPrimary} mb-2 sm:mb-3 leading-tight`}>
                                            {selectedServiceForDetails.name}
                                        </h2>
                                        <div className="w-20 sm:w-24 md:w-28 h-1 sm:h-1.5 bg-gradient-to-r from-[#0f5132] via-[#1a7042] to-[#c99c4e] mb-4 sm:mb-5"></div>
                                    </div>
                                    
                                    {/* Description */}
                                    {selectedServiceForDetails.description && (
                                        <div>
                                            <h3 className={`text-lg sm:text-xl font-semibold ${theme.textPrimary} mb-2 sm:mb-3`}>Description</h3>
                                            <p className={`text-sm sm:text-base md:text-lg ${theme.textSecondary} leading-relaxed whitespace-pre-line`}>
                                                {selectedServiceForDetails.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Footer with Book Service Button */}
                            <div className={`p-4 sm:p-5 md:p-6 border-t ${theme.border} flex-shrink-0 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between`}>
                                <div className="flex-1">
                                    <p className={`text-xs sm:text-sm ${theme.textSecondary}`}>
                                        Ready to book this service?
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsServiceDetailsOpen(false);
                                        handleOpenServiceBookingForm(selectedServiceForDetails.id);
                                    }}
                                    className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-[#0f5132] to-[#1a7042] text-white text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-xl hover:from-[#136640] hover:to-[#218051] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c99c4e]/70 min-h-[44px] sm:min-h-[52px] md:min-h-[56px]"
                                >
                                    Book Service
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Food Item Details Dialog */}
                {isFoodItemDetailsOpen && selectedFoodItemForDetails && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
                        <div className={`w-full max-w-5xl ${theme.bgCard} rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-4 sm:my-8`}>
                            {/* Header */}
                            <div className={`p-4 sm:p-5 md:p-6 flex items-center justify-between border-b ${theme.border} flex-shrink-0`}>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center">
                                    <Coffee className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 ${theme.textAccent}`} />
                                    <span className="whitespace-nowrap">{selectedFoodItemForDetails.name}</span>
                                </h3>
                                <button 
                                    onClick={() => setIsFoodItemDetailsOpen(false)} 
                                    className={`p-1.5 sm:p-2 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center`}
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
                                {/* Image */}
                                {selectedFoodItemForDetails.images && selectedFoodItemForDetails.images.length > 0 ? (
                                    <div className="mb-6">
                                        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden mb-4">
                                            <img 
                                                src={getImageUrl(selectedFoodItemForDetails.images[0].image_url)} 
                                                alt={selectedFoodItemForDetails.name} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }}
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-[#0f5132]/15 via-[#1a7042]/15 to-[#c99c4e]/20 flex items-center justify-center">
                                            <Coffee className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-[#0f5132]" />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Food Item Details */}
                                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                                    {/* Title */}
                                    <div>
                                        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${theme.textPrimary} mb-2 sm:mb-3 leading-tight`}>
                                            {selectedFoodItemForDetails.name}
                                        </h2>
                                        {(selectedFoodItemForDetails.category?.name || selectedFoodItemForDetails.category_name) && (
                                            <p className={`text-base sm:text-lg md:text-xl ${theme.textSecondary} font-medium mb-3 sm:mb-4`}>
                                                Category: {selectedFoodItemForDetails.category?.name || selectedFoodItemForDetails.category_name}
                                            </p>
                                        )}
                                        <div className="w-20 sm:w-24 md:w-28 h-1 sm:h-1.5 bg-gradient-to-r from-[#0f5132] via-[#1a7042] to-[#c99c4e] mb-4 sm:mb-5"></div>
                                    </div>
                                    
                                    {/* Description */}
                                    {selectedFoodItemForDetails.description && (
                                        <div>
                                            <h3 className={`text-lg sm:text-xl font-semibold ${theme.textPrimary} mb-2 sm:mb-3`}>Description</h3>
                                            <p className={`text-sm sm:text-base md:text-lg ${theme.textSecondary} leading-relaxed whitespace-pre-line`}>
                                                {selectedFoodItemForDetails.description}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Availability */}
                                    <div className="pt-4 sm:pt-5 border-t border-gray-200">
                                        <p className={`text-sm sm:text-base ${theme.textSecondary} mb-2 sm:mb-3`}>Availability</p>
                                        <span className={`px-4 py-2 rounded-full text-sm sm:text-base font-semibold ${
                                            selectedFoodItemForDetails.available 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {selectedFoodItemForDetails.available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                    
                                    {/* Price */}
                                    {selectedFoodItemForDetails.price && (
                                        <div className="pt-4 sm:pt-5 border-t border-gray-200">
                                            <p className={`text-sm sm:text-base ${theme.textSecondary} mb-2 sm:mb-3`}>Price</p>
                                            <p className={`text-3xl sm:text-4xl md:text-5xl font-extrabold ${theme.textAccent}`}>
                                                {formatCurrency(selectedFoodItemForDetails.price)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Footer with Order Button */}
                            {selectedFoodItemForDetails.available && (
                                <div className={`p-4 sm:p-5 md:p-6 border-t ${theme.border} flex-shrink-0 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between`}>
                                    <div className="flex-1">
                                        <p className={`text-xs sm:text-sm ${theme.textSecondary}`}>
                                            Ready to order this item?
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsFoodItemDetailsOpen(false);
                                            setIsFoodOrderFormOpen(true);
                                        }}
                                        className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-[#0f5132] to-[#1a7042] text-white text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-xl hover:from-[#136640] hover:to-[#218051] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c99c4e]/70 min-h-[44px] sm:min-h-[52px] md:min-h-[56px]"
                                    >
                                        Order Now
                                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-6" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Package Selection Modal */}
                {isPackageSelectionOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className={`w-full max-w-4xl ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-8`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><Package className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Select a Package</h3>
                                <button onClick={() => setIsPackageSelectionOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                {packages.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {packages.map((pkg) => {
                                            const imgIndex = packageImageIndex[pkg.id] || 0;
                                            const currentImage = pkg.images && pkg.images[imgIndex];
                                            return (
                                                <div 
                                                    key={pkg.id}
                                                    onClick={() => {
                                                        handleOpenPackageBookingForm(pkg.id);
                                                        setIsPackageSelectionOpen(false);
                                                    }}
                                                    className={`${theme.bgCard} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border ${theme.border} cursor-pointer transform hover:-translate-y-1`}
                                                >
                                                    {/* Image Container */}
                                                    <div className="relative h-48 overflow-hidden">
                                                        <img 
                                                            src={currentImage ? getImageUrl(currentImage.image_url) : ITEM_PLACEHOLDER} 
                                                            alt={pkg.title} 
                                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                        />
                                                        {/* Image Slider Dots */}
                                                        {pkg.images && pkg.images.length > 1 && (
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full z-10">
                                                                {pkg.images.map((_, imgIdx) => (
                                                                    <button
                                                                        key={imgIdx}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPackageImageIndex(prev => ({ ...prev, [pkg.id]: imgIdx }));
                                                                        }}
                                                                        className={`w-2 h-2 rounded-full transition-all ${imgIdx === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-5">
                                                        <h3 className={`text-xl font-bold ${theme.textCardPrimary || theme.textPrimary} mb-2 line-clamp-2`}>
                                                            {pkg.title}
                                                        </h3>
                                                        <p className={`text-sm ${theme.textCardSecondary || theme.textSecondary} mb-3 line-clamp-2`}>
                                                            {pkg.description}
                                                        </p>
                                                        <div className={`flex items-center justify-between pt-3 border-t ${theme.cardBorder || theme.border}`}>
                                                            <span className={`text-2xl font-extrabold ${theme.textCardAccent || theme.textAccent}`}>
                                                                {formatCurrency(pkg.price || 0)}
                                                            </span>
                                                            <button 
                                                                className={`px-6 py-2 text-sm font-bold ${theme.buttonBg} ${theme.buttonText} rounded-full shadow-lg ${theme.buttonHover} transition-all duration-300 transform hover:scale-105`}
                                                            >
                                                                Select
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Package className={`w-16 h-16 ${theme.textSecondary} mx-auto mb-4`} />
                                        <p className={`${theme.textSecondary}`}>No packages available at the moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Service Booking Modal */}
                {isServiceBookingFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><ConciergeBell className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Book a Service</h3>
                                <button onClick={() => setIsServiceBookingFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleServiceBookingSubmit} className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Service ID</label>
                                    <input type="number" name="service_id" value={serviceBookingData.service_id || ''} readOnly className={`w-full p-3 rounded-xl ${theme.placeholderBg} ${theme.placeholderText} focus:outline-none`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Full Name</label>
                                    <input type="text" name="guest_name" value={serviceBookingData.guest_name} onChange={handleServiceBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={serviceBookingData.guest_email} onChange={handleServiceBookingChange} placeholder="user@example.com" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={serviceBookingData.guest_mobile} onChange={handleServiceBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Room ID (Optional)</label>
                                    <input type="number" name="room_id" value={serviceBookingData.room_id || ''} onChange={handleServiceBookingChange} placeholder="Enter your room ID if assigned" className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
                
                {/* Food Order Modal */}
                {isFoodOrderFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`w-full max-w-lg ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><Coffee className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Place a Food Order</h3>
                                <button onClick={() => setIsFoodOrderFormOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleFoodOrderSubmit} className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Room ID</label>
                                    <input type="number" name="room_id" value={foodOrderData.room_id || ''} onChange={(e) => setFoodOrderData(prev => ({ ...prev, room_id: parseInt(e.target.value) || '' }))} placeholder="Enter your room ID" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`} />
                                </div>
                                <h4 className={`text-md font-semibold ${theme.textPrimary}`}>Select Items:</h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto">
                                    {foodItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <img src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com/${item.images?.[0]?.image_url}` : `http://localhost:8000/${item.images?.[0]?.image_url}`} alt={item.name} className="w-12 h-12 object-cover rounded-full" />
                                                <div>
                                                    <p className={`font-semibold ${theme.textPrimary}`}>{item.name}</p>
                                                </div>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={foodOrderData.items[item.id] || 0}
                                                onChange={(e) => handleFoodOrderChange(e, item.id)}
                                                className={`w-20 p-2 text-center rounded-lg ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button type="submit" className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={isBookingLoading}>
                                    {isBookingLoading ? 'Placing Order...' : 'Place Order'}
                                </button>
                                {bookingMessage.text && (
                                    <div className={`mt-4 p-3 rounded-xl text-center ${bookingMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {bookingMessage.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
                
                <footer className="bg-[#0f5132] text-white py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12 mt-12">
                    <div className="container mx-auto max-w-7xl flex flex-col gap-6 md:gap-8">
                        {/* Main Footer Content */}
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 gap-4 md:gap-6">
                            {resortInfo && (
                                <>
                                    <div className="text-center md:text-left flex-1">
                                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1 sm:mb-2">{resortInfo.name || 'Pomma Holidays'}</h3>
                                        <p className="text-xs sm:text-sm text-white/80 mt-1">{resortInfo.address || ''}</p>
                                        <p className="text-xs text-white/70 mt-2 sm:mt-3">&copy; {new Date().getFullYear()} Pomma Holidays. TeqMates.</p>
                                    </div>
                                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                                    {resortInfo.facebook && formatUrl(resortInfo.facebook) !== '#' && (
                                        <a 
                                            href={formatUrl(resortInfo.facebook)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            onClick={(e) => {
                                                const url = formatUrl(resortInfo.facebook);
                                                if (url === '#') {
                                                    e.preventDefault();
                                                    return false;
                                                }
                                            }}
                                            className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg cursor-pointer min-h-[44px] min-w-[44px]"
                                            aria-label="Visit our Facebook page"
                                        >
                                            <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </a>
                                    )}
                                    {resortInfo.instagram && formatUrl(resortInfo.instagram) !== '#' && (
                                        <a 
                                            href={formatUrl(resortInfo.instagram)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            onClick={(e) => {
                                                const url = formatUrl(resortInfo.instagram);
                                                if (url === '#') {
                                                    e.preventDefault();
                                                    return false;
                                                }
                                            }}
                                            className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg cursor-pointer min-h-[44px] min-w-[44px]"
                                            aria-label="Visit our Instagram page"
                                        >
                                            <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </a>
                                    )}
                                    {resortInfo.twitter && formatUrl(resortInfo.twitter) !== '#' && (
                                        <a 
                                            href={formatUrl(resortInfo.twitter)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            onClick={(e) => {
                                                const url = formatUrl(resortInfo.twitter);
                                                if (url === '#') {
                                                    e.preventDefault();
                                                    return false;
                                                }
                                            }}
                                            className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg cursor-pointer min-h-[44px] min-w-[44px]"
                                            aria-label="Visit our Twitter page"
                                        >
                                            <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </a>
                                    )}
                                    {resortInfo.linkedin && formatUrl(resortInfo.linkedin) !== '#' && (
                                        <a 
                                            href={formatUrl(resortInfo.linkedin)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            onClick={(e) => {
                                                const url = formatUrl(resortInfo.linkedin);
                                                if (url === '#') {
                                                    e.preventDefault();
                                                    return false;
                                                }
                                            }}
                                            className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg cursor-pointer min-h-[44px] min-w-[44px]"
                                            aria-label="Visit our LinkedIn page"
                                        >
                                            <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </a>
                                    )}
                                </div>
                            </>
                        )}
                        </div>
                        
                        {/* Powered by TeqMates */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-white/20">
                            <span className="text-xs sm:text-sm text-white/60">Powered by</span>
                            <a 
                                href="https://www.teqmates.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l6 3v8.18c0 4.16-2.5 7.92-6 9.2-3.5-1.28-6-5.04-6-9.2V7.18l6-3z"/>
                                </svg>
                                <span className="text-sm sm:text-base font-bold text-white tracking-wide">TeqMates</span>
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}