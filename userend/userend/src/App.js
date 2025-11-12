import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
// Lucide React is used for elegant icons
import { BedDouble, Coffee, ConciergeBell, Package, ChevronRight, ChevronDown, Image as ImageIcon, Star, Quote, ChevronUp, MessageSquare, Send, X, Facebook, Instagram, Linkedin, Twitter, Moon, Sun, Droplet } from 'lucide-react';
// Currency formatting utility
import { formatCurrency } from './utils/currency';

const getApiBaseUrl = () => {
    if (process.env.REACT_APP_API_BASE_URL) {
        return process.env.REACT_APP_API_BASE_URL;
    }

    if (typeof window !== "undefined") {
        const origin = window.location.origin;
        const path = window.location.pathname || "";

        if (path.startsWith("/pommaholidays")) {
            return `${origin}/pommaapi/api`;
        }
    }

    return process.env.NODE_ENV === "production"
        ? "https://www.teqmates.com/pommaapi/api"
        : "http://localhost:8000/api";
};

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
        bgPrimary: "bg-white",
        bgSecondary: "bg-green-50",
        bgCard: "bg-white",
        textPrimary: "text-[#0f5132]",
        textSecondary: "text-[#0f5132]",
        textCardPrimary: "text-[#0f5132]",
        textCardSecondary: "text-[#0f5132]",
        textAccent: "text-[#0f5132]",
        textCardAccent: "text-[#0f5132]",
        cardBorder: "border-gray-200",
        textTitleGradient: "from-[#0f5132] via-[#1a7042] to-[#0f5132]",
        border: "border-gray-200",
        borderHover: "hover:border-[#0f5132]/50",
        buttonBg: "bg-[#0f5132]",
        buttonText: "text-white",
        buttonHover: "hover:bg-[#136640]",
        placeholderBg: "bg-green-50",
        placeholderText: "text-[#0f5132]",
        chatBg: "bg-white",
        chatHeaderBg: "bg-green-50",
        chatInputBorder: "border-gray-200",
        chatInputBg: "bg-green-50",
        chatInputPlaceholder: "placeholder-[#0f5132]",
        chatUserBg: "bg-[#0f5132]",
        chatUserText: "text-white",
        chatModelBg: "bg-green-50",
        chatModelText: "text-[#0f5132]",
        chatLoaderBg: "bg-[#0f5132]",
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
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lavender"><path d="M14.5 16.5c-2.4-1-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5C3.3 6.7 4 6 5 6c1.1 0 2.4.8 3.5 2.5 1.2 1.9 2 4.2 2.5 5.5.5 1.5 1 3.6 2 4.5 1 .8 2.2 1.3 3.5 1C17.3 17.3 18 16.6 18 15.6c0-1.1-.8-2.4-2.5-3.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5.3-1.3 1-2 2-2 1.1 0 2.4.8 3.5 2.5 1.9 1.2 4.2 2 5.5 2.5 1.5.5 3.6 1 4.5 2 .8 1 1.3 2.2 1 3.5-.3 1.3-1 2-2 2-1.1 0-2.4-.8-3.5-2.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5-.3-1.3-1-2-2-2-1.1 0-2.4-.8-3.5-2.5"/><path d="M12 12c-2.4-1-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5.3-1.3 1-2 2-2 1.1 0 2.4.8 3.5 2.5 1.9 1.2 4.2 2 5.5 2.5 1.5.5 3.6 1 4.5 2 .8 1 1.3 2.2 1 3.5-.3 1.3-1 2-2 2-1.1 0-2.4-.8-3.5-2.5"/><path d="M12 12c2.4-1 4.2-2 5.5-2.5 1.5-.5 3.6-1 4.5-2 .8-1 1.3 2.2 1-3.5-.3-1.3-1-2-2-2-1.1 0-2.4.8-3.5 2.5-1.9-1.2-4.2-2-5.5-2.5-1.5-.5-3.6-1-4.5-2-.8-1-1.3-2.2-1-3.5-.3-1.3-1-2-2-2-1.1 0-2.4-.8-3.5-2.5"/></svg>,
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
                /* Green and White Theme - Pomma Holidays */
                :root {
                    --color-green-primary: #0f5132;
                    --color-green-secondary: #1a7042;
                    --color-green-light: #136640;
                    --color-green-dark: #0f5132;
                    --color-white: #ffffff;
                    --color-text-primary: #0f5132;
                    --color-text-secondary: #0f5132;
                    --font-display: 'Playfair Display', serif;
                    --font-body: 'Inter', sans-serif;
                }
                
                /* Make all text green by default - but allow exceptions for white text */
                body {
                    color: #0f5132;
                }
                
                p, span, div, h1, h2, h3, h4, h5, h6, a, li, td, th, label, input, textarea, select {
                    color: #0f5132;
                }
                
                /* Keep white text for buttons with green background, overlays, and hero sections */
                button.text-white,
                .text-white,
                .bg-\[#0f5132\] .text-white,
                .bg-white\/20 .text-white,
                .bg-white\/10 .text-white,
                .absolute.inset-0.bg-gradient-to-t.from-black h1,
                .absolute.inset-0.bg-gradient-to-t.from-black h2,
                .absolute.inset-0.bg-gradient-to-t.from-black h3,
                .absolute.inset-0.bg-gradient-to-t.from-black p,
                .absolute.inset-0.bg-gradient-to-t.from-black span,
                .absolute.inset-0.bg-gradient-to-t.from-black a,
                .absolute.inset-0.bg-gradient-to-t.from-black div,
                /* Ensure ALL green buttons have white text - comprehensive rules */
                button.bg-\[#0f5132\],
                button.bg-\[#0f5132\] *,
                button.bg-\[#0f5132\] span,
                button.bg-\[#0f5132\] svg,
                button.bg-\[#0f5132\] path,
                a.bg-\[#0f5132\],
                a.bg-\[#0f5132\] *,
                a.bg-\[#0f5132\] span,
                a.bg-\[#0f5132\] svg,
                a.bg-\[#0f5132\] path,
                /* Green background elements with buttons/links inside */
                .bg-\[#0f5132\] button,
                .bg-\[#0f5132\] a,
                .bg-\[#0f5132\] button *,
                .bg-\[#0f5132\] a *,
                .bg-\[#0f5132\] button span,
                .bg-\[#0f5132\] a span,
                .bg-\[#0f5132\] button svg,
                .bg-\[#0f5132\] a svg {
                    color: #ffffff !important;
                    fill: #ffffff !important;
                }
                
                /* Hero section text should be white - comprehensive coverage */
                .absolute.inset-0.bg-gradient-to-t.from-black *,
                .absolute.inset-0.bg-gradient-to-t.from-black\/90 *,
                .absolute.inset-0.bg-gradient-to-t.from-black\/60 *,
                .absolute.inset-0.bg-gradient-to-t.from-black\/30 *,
                [class*="bg-gradient-to-t"][class*="from-black"] * {
                    color: #ffffff !important;
                }
                
                /* Ensure hero section buttons with green background have white text */
                .absolute.inset-0 a.bg-\[#0f5132\],
                .absolute.inset-0 a.bg-\[#0f5132\] *,
                .absolute.inset-0 a.bg-\[#0f5132\] span,
                .absolute.inset-0 a.bg-\[#0f5132\] svg,
                .absolute.inset-0 button.bg-\[#0f5132\],
                .absolute.inset-0 button.bg-\[#0f5132\] *,
                .absolute.inset-0 button.bg-\[#0f5132\] span,
                .absolute.inset-0 button.bg-\[#0f5132\] svg,
                [class*="bg-gradient-to-t"] a.bg-\[#0f5132\],
                [class*="bg-gradient-to-t"] a.bg-\[#0f5132\] *,
                [class*="bg-gradient-to-t"] a.bg-\[#0f5132\] span,
                [class*="bg-gradient-to-t"] a.bg-\[#0f5132\] svg {
                    color: #ffffff !important;
                    fill: #ffffff !important;
                    stroke: #ffffff !important;
                }
                
                * {
                    max-width: 100%;
                }
                
                body {
                    font-family: var(--font-display), 'Playfair Display', serif;
                    font-weight: 400;
                    overflow-x: hidden;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    font-family: var(--font-display), 'Playfair Display', serif;
                    font-weight: 700;
                    max-width: 100%;
                    word-wrap: break-word;
                    letter-spacing: -0.02em;
                }
                
                /* Apply Playfair Display to all text elements */
                p, span, div, a, li, td, th, label, input, textarea, select, button {
                    font-family: var(--font-display), 'Playfair Display', serif;
                }
                
                /* Headings with extra elegance */
                h1 {
                    font-weight: 900;
                    letter-spacing: -0.03em;
                }
                
                h2 {
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }
                
                h3 {
                    font-weight: 700;
                    letter-spacing: -0.01em;
                }
                
                section {
                    width: 100%;
                    overflow-x: hidden;
                    max-width: 100vw;
                }
                
                img {
                    max-width: 100%;
                    height: auto;
                }
                
                #packages {
                    width: 100%;
                    max-width: 100vw;
                    overflow-x: hidden;
                }
                
                #packages .package-image {
                    width: 100%;
                    max-width: 100%;
                    height: auto;
                    object-fit: cover;
                    display: block;
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
                
                /* Luxury Mountain Shadows Premium Styling */
                .luxury-card {
                    border-radius: 1rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .luxury-card:hover {
                    box-shadow: 0 20px 25px -5px rgba(15, 81, 50, 0.2), 0 10px 10px -5px rgba(15, 81, 50, 0.1);
                    transform: translateY(-4px) scale(1.01);
                }
                
                .premium-gradient {
                    background: linear-gradient(135deg, #0f5132 0%, #1a7042 50%, #136640 100%);
                }
                
                .premium-text-gradient {
                    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .luxury-overlay {
                    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%);
                }
                
                .section-badge {
                    display: inline-block;
                    padding: 0.5rem 1.5rem;
                    background: rgba(15, 81, 50, 0.1);
                    color: #0f5132;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    border-radius: 9999px;
                    border: 1px solid rgba(15, 81, 50, 0.2);
                    backdrop-filter: blur(10px);
                }
                
                .luxury-shadow {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(15, 81, 50, 0.05);
                }
                
                .card-image {
                    max-height: 200px;
                    object-fit: cover;
                    filter: brightness(1) saturate(1.1);
                    transition: all 0.5s ease;
                }
                
                .luxury-card:hover .card-image {
                    filter: brightness(1.05) saturate(1.2);
                }
                
                .card-title {
                    font-size: 1.125rem;
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                }
                
                .card-description {
                    font-size: 0.875rem;
                    line-height: 1.5;
                    color: #6b7280;
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
                    0%, 100% { filter: brightness(1) drop-shadow(0 0 20px rgba(15, 81, 50, 0.3)); }
                    50% { filter: brightness(1.1) drop-shadow(0 0 30px rgba(15, 81, 50, 0.5)); }
                }
                @keyframes gentle-pulse {
                    0%, 100% { box-shadow: 0 10px 40px rgba(15, 81, 50, 0.3); }
                    50% { box-shadow: 0 15px 60px rgba(15, 81, 50, 0.6); }
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
    if (!url || typeof url !== 'string') return '#'; // Return a safe, non-navigating link if URL is missing
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

export default function App() {
    // Load Playfair Display font from Google Fonts
    useEffect(() => {
        // Check if font link already exists
        const existingLink = document.querySelector('link[href*="Playfair+Display"]');
        if (!existingLink) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap';
            link.rel = 'stylesheet';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        }
    }, []);
    const [rooms, setRooms] = useState([]);
    const [allRooms, setAllRooms] = useState([]); // Store all rooms for filtering
    const [bookings, setBookings] = useState([]); // Store bookings for availability check
    const [services, setServices] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [foodCategories, setFoodCategories] = useState([]);
    const [selectedFoodItem, setSelectedFoodItem] = useState(null);
    const [isFoodDetailsOpen, setIsFoodDetailsOpen] = useState(false);
    const [selectedPackageDetails, setSelectedPackageDetails] = useState(null);
    const [isPackageDetailsModalOpen, setIsPackageDetailsModalOpen] = useState(false);
    const [packageDescriptionExpanded, setPackageDescriptionExpanded] = useState({});
    const [packages, setPackages] = useState([]);
    const [resortInfo, setResortInfo] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [bannerData, setBannerData] = useState([]);
    const [signatureExperiences, setSignatureExperiences] = useState([]);
    const [planWeddings, setPlanWeddings] = useState([]);
    const [nearbyAttractions, setNearbyAttractions] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [currentWeddingIndex, setCurrentWeddingIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
    const [isServiceBookingFormOpen, setIsServiceBookingFormOpen] = useState(false);
    const [isFoodOrderFormOpen, setIsFoodOrderFormOpen] = useState(false);
    const [isGeneralBookingOpen, setIsGeneralBookingOpen] = useState(false);

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
    const [selectedPackage, setSelectedPackage] = useState(null);
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

    // Always use light theme - matching Mountain Shadows style
    const currentTheme = 'light';
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
                nearbyAttractions: '/nearby-attractions/'
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
                    signatureExperiencesData, planWeddingsData, nearbyAttractionsData
                ] = data;

                setAllRooms(roomsData);
                // Don't set rooms here - only show after dates are selected
                // setRooms will be set in useEffect when dates are chosen
                setBookings(bookingsData.bookings || []); // Store bookings for availability filtering
                setServices(servicesData || []); // Fetch services from backend
                setFoodItems(foodItemsData || []);
                setFoodCategories(foodCategoriesData || []);
                setPackages(packagesData);
                setResortInfo(resortInfoData.length > 0 ? resortInfoData[0] : null);
                setGalleryImages(galleryData);
                setReviews(reviewsData);
                setBannerData(bannerData.filter(b => b.is_active));
                setSignatureExperiences(signatureExperiencesData || []);
                setPlanWeddings(planWeddingsData || []);
                setNearbyAttractions(nearbyAttractionsData || []);

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

    const handleOpenPackageDetails = (packageId) => {
        const packageDetails = packages.find(pkg => pkg.id === packageId) || null;
        setSelectedPackageDetails(packageDetails);
        setIsPackageDetailsModalOpen(true);
    };

    const togglePackageDescription = (packageId) => {
        setPackageDescriptionExpanded(prev => ({
            ...prev,
            [packageId]: !prev[packageId]
        }));
    };

    const handleOpenPackageBookingForm = (packageId) => {
        const packageDetails = packages.find(pkg => pkg.id === packageId) || null;
        // Always prioritize dates from bookingData (selected on previous page) over packageBookingData
        setPackageBookingData(prev => {
            const checkIn = (bookingData.check_in && bookingData.check_in.trim() !== '') 
                ? bookingData.check_in 
                : (prev.check_in && prev.check_in.trim() !== '' ? prev.check_in : '');
            const checkOut = (bookingData.check_out && bookingData.check_out.trim() !== '') 
                ? bookingData.check_out 
                : (prev.check_out && prev.check_out.trim() !== '' ? prev.check_out : '');
            
            return {
                ...prev, 
                package_id: packageId,
                room_ids: [],
                check_in: checkIn,
                check_out: checkOut
            };
        });
        setSelectedPackage(packageDetails);
        setIsPackageBookingFormOpen(true);
        setBookingMessage({ type: null, text: "" });
    };

    useEffect(() => {
        if (!packageBookingData.package_id) {
            setSelectedPackage(null);
            return;
        }
        const pkgId = Number(packageBookingData.package_id);
        if (!Number.isInteger(pkgId) || pkgId <= 0) {
            setSelectedPackage(null);
            return;
        }
        const packageDetails = packages.find(pkg => pkg.id === pkgId) || null;
        setSelectedPackage(packageDetails);
        if (packageDetails?.is_full_property) {
            setPackageBookingData(prev => prev.room_ids.length === 0 ? prev : { ...prev, room_ids: [] });
        }
    }, [packageBookingData.package_id, packages]);

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
            let newValue = value;
            if (name === "package_id") {
                newValue = value ? parseInt(value, 10) : null;
            }
            const updated = { ...prev, [name]: newValue };
            // If check_in is changed and is after check_out, clear check_out
            if (name === 'check_in' && value && prev.check_out && value >= prev.check_out) {
                updated.check_out = '';
            }
            // If check_out is changed and is before check_in, clear check_in
            if (name === 'check_out' && value && prev.check_in && value <= prev.check_in) {
                updated.check_in = '';
            }
            if (name === "package_id") {
                updated.room_ids = [];
            }
            return updated;
        });
    };

    const handleServiceBookingChange = (e) => {
        const { name, value } = e.target;
        setServiceBookingData(prev => ({ ...prev, [name]: value }));
    };

    const handlePackageRoomSelection = useCallback((roomId) => {
        if (selectedPackage?.is_full_property) {
            return;
        }
        setPackageBookingData(prev => {
            const normalizedId = Number(roomId);
            const newRoomIds = prev.room_ids.includes(normalizedId)
                ? prev.room_ids.filter(id => id !== normalizedId)
                : [...prev.room_ids, normalizedId];
            return { ...prev, room_ids: newRoomIds };
        });
    }, [selectedPackage]);

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
    const packageSelectableRooms = useMemo(() => {
        if (!selectedPackage || selectedPackage.is_full_property) {
            return allRooms;
        }
        if (selectedPackage.room_type) {
            const targetType = selectedPackage.room_type.toLowerCase();
            return allRooms.filter(room => (room.type || "").toLowerCase() === targetType);
        }
        return allRooms;
    }, [allRooms, selectedPackage]);
    
    const packageRoomAvailabilityMemo = useMemo(() => {
        if (
            !packageBookingData.check_in ||
            !packageBookingData.check_out ||
            packageSelectableRooms.length === 0 ||
            !isPackageBookingFormOpen ||
            selectedPackage?.is_full_property
        ) {
            return {};
        }
        
        // Calculate availability for each room for package booking (memoized for performance)
        const availability = {};
        packageSelectableRooms.forEach(room => {
            const hasConflict = bookings.some(booking => {
                const normalizedStatus = booking.status?.toLowerCase().replace(/_/g, '-');
                if (normalizedStatus === "cancelled" || normalizedStatus === "checked-out") return false;
                
                const bookingCheckIn = new Date(booking.check_in);
                const bookingCheckOut = new Date(booking.check_out);
                const requestedCheckIn = new Date(packageBookingData.check_in);
                const requestedCheckOut = new Date(packageBookingData.check_out);
                
                const isRoomInBooking = booking.rooms && booking.rooms.some(r => r.room && r.room.id === room.id);
                if (!isRoomInBooking) return false;
                
                return (requestedCheckIn < bookingCheckOut && requestedCheckOut > bookingCheckIn);
            });
            
            availability[room.id] = !hasConflict;
        });
        return availability;
    }, [packageBookingData.check_in, packageBookingData.check_out, packageSelectableRooms, bookings, isPackageBookingFormOpen, selectedPackage]);
    
    // Update state with debouncing to prevent excessive re-renders
    useEffect(() => {
        const timer = setTimeout(() => {
            setPackageRoomAvailability(packageRoomAvailabilityMemo);
        }, 100); // 100ms debounce
        return () => clearTimeout(timer);
    }, [packageRoomAvailabilityMemo]);

    const packageAvailableRooms = useMemo(() => {
        if (!selectedPackage || selectedPackage.is_full_property) {
            return [];
        }
        if (!packageBookingData.check_in || !packageBookingData.check_out) {
            return packageSelectableRooms;
        }
        return packageSelectableRooms.filter(room => packageRoomAvailability[room.id] !== false);
    }, [packageSelectableRooms, packageRoomAvailability, packageBookingData.check_in, packageBookingData.check_out, selectedPackage]);

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

        const packageDetails =
            selectedPackage ||
            packages.find(pkg => pkg.id === parseInt(packageBookingData.package_id || 0, 10));
        const isFullPropertyPackage = Boolean(packageDetails?.is_full_property);

        if (!isFullPropertyPackage && packageBookingData.room_ids.length === 0) {
            showBannerMessage("error", "Please select at least one room for the package.");
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
        const selectedRoomDetails = (isFullPropertyPackage ? allRooms : rooms)
            .filter(room => isFullPropertyPackage || packageBookingData.room_ids.includes(room.id));
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
                package_id: parseInt(packageBookingData.package_id, 10),
                room_ids: isFullPropertyPackage
                    ? []
                    : packageBookingData.room_ids.map(id => parseInt(id, 10)),
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

    const sectionTitleStyle = `text-3xl md:text-5xl font-extrabold mb-8 text-center tracking-tight bg-gradient-to-r ${theme.textTitleGradient} text-transparent bg-clip-text`;
    const cardStyle = `flex-none w-80 md:w-96 ${theme.bgCard} rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out border ${theme.border} ${theme.borderHover} transform group-hover:-translate-y-1 group-hover:shadow-lg`;
    const iconStyle = `w-6 h-6 ${theme.textAccent} transition-transform duration-300 group-hover:rotate-12`;
    const textPrimary = theme.textPrimary;
    const textSecondary = theme.textSecondary;
    const priceStyle = `font-bold text-xl ${theme.textAccent} tracking-wider`;
    const buttonStyle = `mt-4 inline-flex items-center text-sm font-semibold ${theme.textAccent} hover:text-white transition duration-300`;

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-screen bg-transparent`}>
                <div className="flex flex-col items-center">
                    {/* Animated Logo Loader with Rotating Border */}
                    <div className="relative mb-8" style={{ width: '120px', height: '120px' }}>
                        {/* Green Background Circle */}
                        <div className="absolute inset-0 rounded-full bg-[#0f5132]" style={{ width: '120px', height: '120px' }}></div>
                        {/* Rotating Border */}
                        <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin" style={{ animationDuration: '2s', animationIterationCount: 'infinite', animationTimingFunction: 'linear', width: '120px', height: '120px' }}></div>
                        {/* Logo Container - No rotation */}
                        <div className="relative rounded-full p-8" style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img 
                                src="/pommaholidays/logo.png" 
                                alt="Pomma Holidays Logo" 
                                className="w-20 h-20 object-contain" 
                                style={{ animation: 'none', filter: 'brightness(0) invert(1)' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-20 h-20 flex items-center justify-center text-3xl font-bold text-white';
                                    fallback.textContent = 'PH';
                                    e.target.parentNode.appendChild(fallback);
                                }}
                            />
                        </div>
                    </div>
                    {/* Loading Text */}
                    <p className="text-xl font-semibold text-[#0f5132] animate-pulse" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Loading Pomma Holidays...
                    </p>
                    {/* Loading Dots */}
                    <div className="flex gap-2 mt-4">
                        <div className="w-3 h-3 bg-[#0f5132] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-3 h-3 bg-[#0f5132] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-[#0f5132] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
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

            <div className={`relative ${theme.bgPrimary} ${theme.textPrimary} min-h-screen transition-colors duration-500`}>
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
                
                <header className={`fixed left-0 right-0 z-50 bg-[#0f5132]/40 backdrop-blur-md shadow-md ${bannerMessage.text ? 'top-16' : 'top-0'} transition-all duration-300`}>
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-10 h-16 sm:h-20 flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 h-full">
                            {/* Pomma Holidays Logo */}
                            <div className="flex items-center h-full px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <img 
                                    src="/pommaholidays/logo.png" 
                                    alt="Pomma Holidays Logo" 
                                    className="h-8 sm:h-10 md:h-12 object-contain cursor-pointer"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        const fallback = e.target.nextElementSibling;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                    style={{ maxHeight: '48px' }}
                                    onClick={() => window.location.href = '/pommaholidays/'}
                                />
                            </div>
                            <div className="hidden items-center gap-2">
                                <BedDouble className="w-8 h-8 text-white" />
                                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                                    Pomma Holidays
                                </span>
                            </div>
                        </div>
                        <nav className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsGeneralBookingOpen(true)} 
                                className="px-5 sm:px-6 py-2 text-sm font-semibold text-white bg-white/20 hover:bg-white/30 rounded-full border border-white/30 transition-all duration-300 hover:scale-105"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 flex items-center justify-center text-center px-6">
                <div className="relative w-full max-w-5xl">
                    {bannerData.map((banner, index) => (
                        <div key={banner.id} className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${index === currentBannerIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <div className="mb-4 inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 animate-[fadeInUp_1s_ease-out]">
                                <span className="text-white text-sm font-semibold tracking-widest uppercase">
                                    ✦ Luxury Experience ✦
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight drop-shadow-2xl text-white mb-6 animate-[fadeInUp_1.2s_ease-out]">
                                {banner.title}
                            </h1>
                            <p className="mt-4 text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed drop-shadow-lg px-4 animate-[fadeInUp_1.4s_ease-out]">
                                {banner.subtitle}
                            </p>
                            <div className="mt-10 flex flex-wrap justify-center gap-4 animate-[fadeInUp_1.6s_ease-out]">
                                <button 
                                    onClick={() => setIsGeneralBookingOpen(true)}
                                    className="group px-10 py-4 bg-[#0f5132] text-white font-bold text-lg rounded-full shadow-2xl hover:bg-[#136640] transition-all duration-300 transform hover:scale-110 border-2 border-white/20" 
                                    style={{ color: '#ffffff' }}
                                >
                                    <span className="flex items-center gap-2" style={{ color: '#ffffff' }}>
                                        Book Your Stay
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                    </span>
                                </button>
                                <a href="#packages" className="px-10 py-4 bg-white text-[#0f5132] font-bold text-lg rounded-full border-2 border-white hover:bg-white/90 transition-all duration-300 shadow-lg">
                                    View Packages
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Luxury Navigation Dots - Only show if multiple banners */}
            {bannerData.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {bannerData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBannerIndex(index)}
                        className={`transition-all duration-300 ${
              index === currentBannerIndex
                                ? "w-12 h-1 bg-white rounded-full"
                                : "w-8 h-1 bg-white/40 hover:bg-white/60 rounded-full"
            }`}
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

                    {/* Exclusive Deals Section - Mountain Shadows Style */}
                    <section id="packages" className={`bg-gradient-to-b ${theme.bgSecondary} ${theme.bgCard} py-12 sm:py-16 md:py-20 transition-colors duration-500 w-full overflow-x-hidden`} style={{ width: '100%', maxWidth: '100vw' }}>
                        <div className="w-full max-w-full mx-auto">
                            {/* Section Header */}
                            <div className="text-center mb-8 sm:mb-12 md:mb-16 px-4 sm:px-6 md:px-8">
                                <span className="inline-block px-4 sm:px-6 py-2 bg-green-100 text-[#0f5132] text-xs sm:text-sm font-semibold tracking-widest uppercase rounded-full mb-3 sm:mb-4">
                                    ✦ Exclusive Deals ✦
                                </span>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4" style={{ color: '#0f5132' }}>
                                    EXCLUSIVE DEALS FOR MEMORABLE EXPERIENCES
                                </h2>
                            </div>

                            {/* Packages - Mountain Shadows Style with Green Theme */}
                            {packages.length > 0 ? (
                                <div className="space-y-6 sm:space-y-8 md:space-y-12 w-full" style={{ width: '100%' }}>
                                    {/* Featured Large Package - Split Layout (Image Left, Content Right) */}
                                    {packages[0] && (() => {
                                        const featuredPkg = packages[0];
                                        const imgIndex = packageImageIndex[featuredPkg.id] || 0;
                                        const currentImage = featuredPkg.images && featuredPkg.images[imgIndex];
                                        return (
                                            <div 
                                                key={featuredPkg.id}
                                                onClick={() => handleOpenPackageDetails(featuredPkg.id)}
                                                className={`${theme.bgCard} rounded-2xl overflow-hidden shadow-2xl border ${theme.border} transition-all duration-500 hover:shadow-3xl reveal w-full cursor-pointer`}
                                                style={{ transitionDelay: '80ms', height: '500px', minHeight: '500px', maxHeight: '500px' }}
                                            >
                                                <div className="flex flex-col md:flex-row items-stretch h-full" style={{ height: '500px', minHeight: '500px', maxHeight: '500px' }}>
                                                    {/* Large Image Section - Left - Fixed Size */}
                                                    <div className="w-full md:w-2/5 overflow-hidden relative bg-gray-50 flex-shrink-0" style={{ height: '500px', minHeight: '500px', maxHeight: '500px' }}>
                                                        <img 
                                                            src={currentImage ? getImageUrl(currentImage.image_url) : ITEM_PLACEHOLDER} 
                                                            alt={featuredPkg.title} 
                                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                                                            loading="lazy"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                        />
                                                        {/* Price badge - green theme */}
                                                        <div className="absolute bottom-4 left-4 bg-white/95 text-[#0f5132] font-extrabold text-2xl md:text-3xl px-4 py-2 rounded-xl shadow-lg">
                                                            {formatCurrency(featuredPkg.price || 0)}
                                                        </div>
                                                        {/* Image Slider Dots */}
                                                        {featuredPkg.images && featuredPkg.images.length > 1 && (
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full z-10">
                                                                {featuredPkg.images.map((_, imgIdx) => (
                                                                    <button
                                                                        key={imgIdx}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPackageImageIndex(prev => ({ ...prev, [featuredPkg.id]: imgIdx }));
                                                                        }}
                                                                        className={`w-2 h-2 rounded-full transition-all ${imgIdx === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Content Section - Right - Fixed Size */}
                                                    <div className={`w-full md:w-3/5 p-5 md:p-8 flex flex-col justify-between ${theme.bgCard} overflow-hidden flex-shrink-0`} style={{ height: '500px', minHeight: '500px', maxHeight: '500px' }}>
                                                        <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: '0' }}>
                                                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 leading-tight line-clamp-2" style={{ color: '#0f5132' }}>
                                                                {featuredPkg.title}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-2 mb-3 flex-shrink-0">
                                                                {featuredPkg.is_full_property && (
                                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                                                                        Full Property
                                                                    </span>
                                                                )}
                                                                {featuredPkg.room_type && !featuredPkg.is_full_property && (
                                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 uppercase tracking-wide">
                                                                        {featuredPkg.room_type} Rooms
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Description with Read More - Fixed Height */}
                                                            <div className="mb-4 flex-1 overflow-hidden" style={{ minHeight: '80px', maxHeight: '150px' }}>
                                                                <div className={`relative h-full overflow-y-auto ${packageDescriptionExpanded[featuredPkg.id] ? '' : ''}`}>
                                                                    <p className={`text-sm md:text-base leading-relaxed ${packageDescriptionExpanded[featuredPkg.id] ? '' : 'line-clamp-4'}`} style={{ color: '#0f5132' }}>
                                                                        {featuredPkg.description || 'No description available.'}
                                                                    </p>
                                                                </div>
                                                                {featuredPkg.description && featuredPkg.description.length > 100 && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            togglePackageDescription(featuredPkg.id);
                                                                        }}
                                                                        className="mt-2 text-[#0f5132] font-semibold hover:underline text-xs sm:text-sm flex-shrink-0"
                                                                    >
                                                                        {packageDescriptionExpanded[featuredPkg.id] ? 'Read Less' : 'Read More'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* Price and Button Section - Fixed at Bottom */}
                                                        <div className="pt-3 border-t border-gray-200 flex-shrink-0">
                                                            <div className="mb-3">
                                                                <p className="text-xs mb-1" style={{ color: '#0f5132' }}>Starting from</p>
                                                                <p className="text-2xl md:text-3xl font-extrabold" style={{ color: '#0f5132' }}>
                                                                    {formatCurrency(featuredPkg.price || 0)}
                                                                    <span className="text-base font-normal ml-2" style={{ color: '#0f5132' }}>/package</span>
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenPackageDetails(featuredPkg.id);
                                                                    }} 
                                                                    className="px-4 md:px-6 py-2 bg-transparent text-[#0f5132] font-bold text-sm md:text-base rounded-md border-2 border-[#0f5132] hover:bg-[#0f5132] hover:text-white transition-all duration-300 flex-1 min-w-[120px]"
                                                                >
                                                                    <span className="flex items-center justify-center gap-2">
                                                                        KNOW MORE
                                                                        <ChevronRight className="w-4 h-4" />
                                                                    </span>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenPackageBookingForm(featuredPkg.id);
                                                                    }} 
                                                                    className="px-4 md:px-6 py-2 bg-[#0f5132] text-white font-bold text-sm md:text-base rounded-md border-2 border-[#0f5132] hover:bg-[#136640] transition-all duration-300 flex-1 min-w-[120px]"
                                                                    style={{ color: '#ffffff' }}
                                                                >
                                                                    <span className="flex items-center justify-center gap-2" style={{ color: '#ffffff' }}>
                                                                        BOOK NOW
                                                                        <ChevronRight className="w-4 h-4" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Smaller Packages Grid - Responsive Full Width */}
                                    {packages.length > 1 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 w-full px-0 sm:px-2 md:px-4 lg:px-6" style={{ width: '100%' }}>
                                    {packages.slice(1).map((pkg) => {
                                        const imgIndex = packageImageIndex[pkg.id] || 0;
                                        const currentImage = pkg.images && pkg.images[imgIndex];
                                        return (
                                            <div 
                                                key={pkg.id} 
                                                onClick={() => handleOpenPackageDetails(pkg.id)}
                                                className={`group relative ${theme.bgCard} rounded-none sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-0 sm:border ${theme.border} cursor-pointer reveal w-full mx-0 flex flex-col`}
                                                style={{ transitionDelay: `${(imgIndex % 5) * 70}ms`, width: '100%', height: '520px', minHeight: '520px', maxHeight: '520px' }}
                                            >
                                                        {/* Image Container - Fixed Size */}
                                                    <div className="relative w-full overflow-hidden flex-shrink-0" style={{ width: '100%', height: '260px', minHeight: '260px', maxHeight: '260px' }}>
                                                    <img 
                                                                src={currentImage ? getImageUrl(currentImage.image_url) : ITEM_PLACEHOLDER} 
                                                        alt={pkg.title} 
                                                        className="package-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 reveal" 
                                                        loading="lazy"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                    />
                                                    {/* Price badge - always visible - green theme */}
                                                    <div className="absolute bottom-3 left-3 bg-white/90 text-[#0f5132] font-extrabold text-base sm:text-lg md:text-xl px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md">
                                                        {formatCurrency(pkg.price || 0)}
                                                    </div>
                                                            {/* Quick Book button overlay - green theme */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    handleOpenPackageDetails(pkg.id); 
                                                                }}
                                                                className="absolute top-3 right-3 bg-[#0f5132] text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md hover:bg-[#136640] transition-all duration-300"
                                                                style={{ color: '#ffffff' }}
                                                            >
                                                                View Details
                                                            </button>
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

                                                        {/* Content - Fixed Size with Proper Spacing */}
                                                        <div className={`p-3 sm:p-4 md:p-5 ${theme.bgCard} flex-1 flex flex-col overflow-hidden`} style={{ height: '240px', minHeight: '240px', maxHeight: '240px' }}>
                                                            <h3 className={`text-base sm:text-lg md:text-xl font-extrabold ${theme.textPrimary} mb-1 sm:mb-2 leading-tight line-clamp-1`} style={{ color: '#0f5132' }}>
                                                                {pkg.title}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 flex-shrink-0">
                                                                {pkg.is_full_property && (
                                                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                                                                        Full Property
                                                                    </span>
                                                                )}
                                                                {pkg.room_type && !pkg.is_full_property && (
                                                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 uppercase tracking-wide">
                                                                        {pkg.room_type} Rooms
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Description with Read More - Fixed Height */}
                                                            <div className="mb-2 flex-1 overflow-hidden" style={{ minHeight: '60px', maxHeight: '100px' }}>
                                                                <div className={`relative h-full overflow-y-auto ${packageDescriptionExpanded[pkg.id] ? '' : ''}`}>
                                                                    <p className={`text-xs sm:text-sm leading-relaxed ${packageDescriptionExpanded[pkg.id] ? '' : 'line-clamp-3'}`} style={{ color: '#0f5132' }}>
                                                                        {pkg.description || 'No description available.'}
                                                                    </p>
                                                                </div>
                                                                {pkg.description && pkg.description.length > 80 && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            togglePackageDescription(pkg.id);
                                                                        }}
                                                                        className="mt-1 text-[#0f5132] font-semibold hover:underline text-xs flex-shrink-0"
                                                                    >
                                                                        {packageDescriptionExpanded[pkg.id] ? 'Read Less' : 'Read More'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {/* Price and Buttons - Fixed at Bottom */}
                                                            <div className="pt-2 border-t border-gray-200 flex-shrink-0">
                                                                <p className="text-xs mb-1.5" style={{ color: '#0f5132' }}>Starting from</p>
                                                                <p className="text-lg sm:text-xl font-extrabold mb-2" style={{ color: '#0f5132' }}>
                                                                    {formatCurrency(pkg.price || 0)}
                                                                    <span className="text-xs font-normal ml-1" style={{ color: '#0f5132' }}>/package</span>
                                                                </p>
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleOpenPackageDetails(pkg.id);
                                                                        }} 
                                                                        className="px-3 py-1.5 bg-transparent text-[#0f5132] font-semibold text-xs rounded-md border border-[#0f5132] hover:bg-[#0f5132] hover:text-white transition-all duration-300 flex-1 min-w-[90px]"
                                                                    >
                                                                        KNOW MORE
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleOpenPackageBookingForm(pkg.id);
                                                                        }} 
                                                                        className="px-3 py-1.5 bg-[#0f5132] text-white font-semibold text-xs rounded-md border border-[#0f5132] hover:bg-[#136640] transition-all duration-300 flex-1 min-w-[90px]"
                                                                        style={{ color: '#ffffff' }}
                                                                    >
                                                                        BOOK NOW
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                            </div>
                                        );
                                    })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No packages available at the moment.</p>
                            )}
                        </div>
                    </section>
                    
                    {/* Luxury Villa Showcase Section */}
                    <section id="rooms-section" className={`bg-gradient-to-b ${theme.bgCard} ${theme.bgSecondary} py-20 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-green-100 text-[#0f5132] text-sm font-semibold tracking-widest uppercase rounded-full mb-4">
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
                                                onClick={() => setIsGeneralBookingOpen(true)}
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
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {rooms.map((room, index) => (
                                        <div 
                                            key={room.id} 
                                            className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden luxury-shadow transition-all duration-300 transition-all duration-500 transform hover:-translate-y-2 border ${theme.cardBorder || theme.border}`}
                                        >
                                            {/* Image Container with Overlay */}
                                            <div className="relative h-48 overflow-hidden">
                                                <img 
                                                    src={getImageUrl(room.image_url)} 
                                                    alt={room.type} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                    onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                                
                                                {/* Luxury Badge */}
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-4 py-2 bg-[#0f5132] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                                        Premium Villa
                                                    </span>
                                                </div>

                                                {/* Availability Badge - Only show when dates are selected */}
                                                {bookingData.check_in && bookingData.check_out && (
                                                <div className="absolute top-4 right-4">
                                                        {roomAvailability[room.id] ? (
                                                            <span className="px-4 py-2 rounded-full text-xs font-bold shadow-lg bg-green-500 text-white">
                                                                Available
                                                    </span>
                                                        ) : (
                                                            <span className="px-4 py-2 rounded-full text-xs font-bold shadow-lg bg-red-500 text-white">
                                                                Booked
                                                            </span>
                                                        )}
                                                </div>
                                                )}

                                                {/* Hover Effect Overlay */}
                                                <div className="absolute inset-0 bg-[#0f5132]/0 group-hover:bg-[#0f5132]/10 transition-all duration-500" />
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 space-y-4">
                                                <h3 className={`text-2xl font-bold ${theme.textCardPrimary || theme.textPrimary} group-hover:${theme.textCardAccent || theme.textAccent} transition-colors`}>
                                                    {room.type}
                                                </h3>
                                                <div className={`flex items-center gap-2 text-sm ${theme.textCardSecondary || theme.textSecondary}`}>
                                                    <BedDouble className={`w-5 h-5 ${theme.textCardAccent || theme.textAccent}`} />
                                                    <span>Room #{room.number}</span>
                                                </div>
                                                
                                                {/* Features */}
                                                <div className={`flex flex-wrap gap-3 text-sm ${theme.textCardSecondary || theme.textSecondary}`}>
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
                                                            : 'bg-[#0f5132] text-white hover:bg-[#136640] hover:shadow-[#0f5132]/50'
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
                    
                    {/* Premium Experiences Section - Mountain Shadows Style */}
                    <section className={`${theme.bgCard} py-20 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-green-100 text-[#0f5132] text-sm font-semibold tracking-widest uppercase rounded-full mb-4">
                                    ✦ Signature Experiences ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    SIGNATURE EXPERIENCES AT THE BEST LUXURY RESORT
                        </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Guests can enjoy a range of curated in-house activities designed to explore the region's rich flora and fauna
                                </p>
                            </div>

                            {/* Signature Experiences Grid */}
                            {signatureExperiences.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {signatureExperiences.filter(exp => exp.is_active).map((experience) => (
                                        <div 
                                            key={experience.id}
                                            className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden luxury-shadow transition-all duration-300 transition-all duration-500 transform hover:-translate-y-2 border ${theme.cardBorder || theme.border}`}
                                        >
                                            {/* Image Container */}
                                            <div className="relative h-64 overflow-hidden">
                                                <img 
                                                    src={getImageUrl(experience.image_url)} 
                                                    alt={experience.title} 
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                    />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 space-y-3">
                                                <h3 className={`text-xl font-bold ${theme.textCardPrimary || theme.textPrimary} group-hover:${theme.textCardAccent || theme.textAccent} transition-colors line-clamp-2`}>
                                                    {experience.title}
                                                </h3>
                                                <p className={`${theme.textCardSecondary || theme.textSecondary} text-sm leading-relaxed line-clamp-3`}>
                                                    {experience.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No signature experiences available at the moment.</p>
                            )}
                        </div>
                    </section>

                    {/* Premium Services Showcase Section */}
                    <section className={`${theme.bgCard} py-20 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-green-100 text-[#0f5132] text-sm font-semibold tracking-widest uppercase rounded-full mb-4">
                                    ✦ Premium Services ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    WORLD-CLASS AMENITIES & SERVICES
                                </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Experience unparalleled luxury with our comprehensive range of world-class amenities and personalized services
                                </p>
                            </div>

                            {/* Services Grid - 2 Column Layout with Images */}
                            {services.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {services.slice(0, 4).map((service) => (
                                        <div 
                                            key={service.id}
                                            className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden luxury-shadow transition-all duration-500 transform hover:-translate-y-2 border ${theme.border}`}
                                        >
                                            {/* Image Container */}
                                            <div className="relative h-48 overflow-hidden">
                                                {service.images && service.images.length > 0 ? (
                                                    <img 
                                                        src={getImageUrl(service.images[0].image_url)} 
                                                        alt={service.name} 
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                                                        <ConciergeBell className="w-12 h-12 text-[#0f5132]" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                                                
                                                {/* Multiple Images Indicator */}
                                                {service.images && service.images.length > 1 && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                                                            +{service.images.length - 1}
                                                        </span>
                                                </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 space-y-3">
                                                <h3 className={`text-lg font-bold ${theme.textCardPrimary || theme.textPrimary} group-hover:${theme.textCardAccent || theme.textAccent} transition-colors line-clamp-2`}>
                                                        {service.name}
                                                    </h3>
                                                <p className={`${theme.textCardSecondary || theme.textSecondary} text-sm leading-relaxed line-clamp-3`}>
                                                        {service.description}
                                                    </p>
                                                </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-center py-12 ${theme.textSecondary}`}>No services available at the moment.</p>
                            )}

                            {/* View More Button */}
                            {services.length > 4 && (
                                <div className="text-center mt-12">
                                    <button className="px-10 py-4 bg-[#0f5132] text-white font-bold text-lg rounded-full shadow-xl hover:bg-[#136640] transition-all duration-300 transform hover:scale-105">
                                        View All Services
                                            </button>
                                        </div>
                            )}
                                    </div>
                    </section>

                    {/* Premium Cuisine Section - Mountain Shadows Style */}
                    <section className={`bg-gradient-to-b ${theme.bgCard} ${theme.bgSecondary} py-20 pb-28 transition-colors duration-500`}>
                        <div className="w-full mx-auto px-2 sm:px-4 md:px-6">
                            {/* Section Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block px-6 py-2 bg-green-100 text-[#0f5132] text-sm font-semibold tracking-widest uppercase rounded-full mb-4">
                                    ✦ Savor the Art ✦
                                </span>
                                <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    SAVOR THE ART OF CUISINE
                                </h2>
                                <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
                                    Experience the art of cuisine at our luxury resort. Enjoy a diverse menu featuring international favorites and authentic local flavors, crafted to delight every palate.
                                </p>
                            </div>

                            {/* Food Categories - Display above food items */}
                            {foodCategories.length > 0 && (
                                <div className="mb-8">
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {foodCategories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => {
                                                    // Scroll to category section or filter
                                                    const element = document.getElementById(`food-category-${category.id}`);
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }
                                                }}
                                                className="px-6 py-3 bg-[#0f5132] text-white font-semibold rounded-full hover:bg-[#136640] transition-all duration-300 shadow-lg hover:shadow-xl"
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Food Items by Category */}
                            {foodCategories.length > 0 ? (
                                <div className="space-y-12">
                                    {foodCategories.map((category) => {
                                        const categoryFoods = foodItems.filter(food => food.category_id === category.id);
                                        if (categoryFoods.length === 0) return null;
                                        
                                        return (
                                            <div key={category.id} id={`food-category-${category.id}`} className="scroll-mt-20">
                                                {/* Category Header */}
                                                <div className="mb-6 text-center">
                                                    <h3 className={`text-2xl md:text-3xl font-extrabold ${theme.textPrimary} mb-2`}>
                                                        {category.name}
                                                    </h3>
                                                    <div className="w-24 h-1 bg-gradient-to-r from-[#0f5132] to-[#1a7042] mx-auto"></div>
                                                </div>
                                                
                                                {/* Food Items Grid for this Category */}
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                                    {categoryFoods.map((food) => (
                                                        <div 
                                                            key={food.id}
                                                            onClick={() => {
                                                                setSelectedFoodItem(food);
                                                                setIsFoodDetailsOpen(true);
                                                            }}
                                                            className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden luxury-shadow transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border ${theme.cardBorder || theme.border}`}
                                                        >
                                                            {/* Image */}
                                                            <div className="relative h-40 overflow-hidden">
                                                                <img 
                                                                    src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com/${food.images?.[0]?.image_url}` : `http://localhost:8000/${food.images?.[0]?.image_url}`} 
                                                                    alt={food.name} 
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                                    onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                                
                                                                {/* Category Badge */}
                                                                <div className="absolute top-3 left-3">
                                                                    <span className="px-3 py-1 bg-[#0f5132] text-white text-xs font-bold rounded-full shadow-lg">
                                                                        {category.name}
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Availability Badge */}
                                                                <div className="absolute top-3 right-3">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${food.available ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                                                        {food.available ? "Available" : "Unavailable"}
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Click Indicator */}
                                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                                                    Click for details
                                                                </div>
                                                            </div>

                                                            {/* Content */}
                                                            <div className="p-5">
                                                                <h3 className={`text-lg font-bold ${theme.textCardPrimary || theme.textPrimary} group-hover:${theme.textCardAccent || theme.textAccent} transition-colors mb-2 line-clamp-2`}>
                                                                    {food.name}
                                                                </h3>
                                                                <p className={`text-sm ${theme.textCardSecondary || theme.textSecondary} line-clamp-2`}>
                                                                    {food.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // Fallback: Show all food items if no categories
                                foodItems.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                        {foodItems.map((food) => (
                                            <div 
                                                key={food.id}
                                                onClick={() => {
                                                    setSelectedFoodItem(food);
                                                    setIsFoodDetailsOpen(true);
                                                }}
                                                className={`group relative ${theme.bgCard} rounded-2xl overflow-hidden luxury-shadow transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border ${theme.cardBorder || theme.border}`}
                                            >
                                                {/* Image */}
                                                <div className="relative h-40 overflow-hidden">
                                                    <img 
                                                        src={process.env.NODE_ENV === 'production' ? `https://www.teqmates.com/${food.images?.[0]?.image_url}` : `http://localhost:8000/${food.images?.[0]?.image_url}`} 
                                                        alt={food.name} 
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                        onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                    
                                                    {/* Availability Badge */}
                                                    <div className="absolute top-4 right-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${food.available ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                                            {food.available ? "Available" : "Unavailable"}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Click Indicator */}
                                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                                        Click for details
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-5">
                                                    <h3 className={`text-xl font-bold ${theme.textCardPrimary || theme.textPrimary} group-hover:${theme.textCardAccent || theme.textAccent} transition-colors mb-2 line-clamp-2`}>
                                                        {food.name}
                                                    </h3>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={`text-center py-12 ${theme.textSecondary}`}>No food items available at the moment.</p>
                                )
                            )}

                            {/* View More Button */}
                            {foodItems.length > 8 && (
                                <div className="text-center mt-12">
                                    <button className="px-10 py-4 bg-white text-[#0f5132] font-bold text-lg rounded-full border-2 border-[#0f5132] hover:bg-green-50 transition-all duration-300">
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
                                <span className="inline-block px-6 py-2 bg-green-100 text-[#0f5132] text-sm font-semibold tracking-widest uppercase rounded-full mb-4">
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

                    {/* Plan Your Wedding Section - Dynamic with Slider */}
                    {planWeddings.length > 0 && planWeddings.some(w => w.is_active) && (
                        <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
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
                                            <div className="mb-6 inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 animate-[fadeInUp_1s_ease-out]">
                                                <span className="text-white text-sm font-semibold tracking-widest uppercase">
                                                    ✦ Perfect Venue ✦
                                                </span>
                                            </div>

                                            {/* Main Title */}
                                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-6 animate-[fadeInUp_1.2s_ease-out] drop-shadow-2xl leading-tight">
                                                {wedding.title.split(' ').slice(0, 3).join(' ')}<br/>
                                                <span className="text-white">
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
                                                    ? "w-12 h-1 bg-white rounded-full"
                                                    : "w-8 h-1 bg-white/40 hover:bg-white/60 rounded-full"
                                            }`}
                                            aria-label={`Go to slide ${index + 1}`}
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
                                    <span className="inline-block px-6 py-2 bg-green-100 text-[#0f5132] text-sm font-semibold tracking-widest uppercase rounded-full mb-4">
                                    ✦ Explore ✦
                                </span>
                                    <h2 className={`text-4xl md:text-5xl font-extrabold ${theme.textPrimary} mb-4`}>
                                    NEARBY ATTRACTIONS
                        </h2>
                                    </div>

                                {/* Split Layout - Image Left, Text Right or vice versa */}
                                <div className="space-y-12">
                                    {nearbyAttractions.filter(attr => attr.is_active).map((attraction, index) => {
                                        // Generate Google Maps URL from map_link if available, or search by title
                                        const getGoogleMapsUrl = () => {
                                            if (attraction.map_link) {
                                                return attraction.map_link.startsWith('http') 
                                                    ? attraction.map_link 
                                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.map_link)}`;
                                            }
                                            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.title)}`;
                                        };
                                        
                                        return (
                                            <div 
                                                key={attraction.id} 
                                                className={`${theme.bgCard} rounded-3xl overflow-hidden shadow-2xl border ${theme.border} transition-all duration-500 hover:shadow-3xl`}
                                            >
                                                <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-stretch`}>
                                                    {/* Image Section - Natural Height, Centered */}
                                                    <div className="w-full md:w-1/2 relative overflow-hidden flex items-center justify-center bg-gray-100">
                                                        <img 
                                                            src={getImageUrl(attraction.image_url)} 
                                                            alt={attraction.title} 
                                                            className="w-full h-auto object-contain transition-transform duration-700 hover:scale-110 max-w-full" 
                                                            style={{ maxHeight: '100%' }}
                                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                        />
                                                    </div>
                                                    
                                                    {/* Content Section */}
                                                    <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between ${theme.bgCard}`}>
                                                        <div>
                                                            <h3 className={`text-3xl md:text-4xl font-extrabold ${theme.textPrimary} mb-4 leading-tight`}>
                                                                {attraction.title}
                                                            </h3>
                                                            <div className="w-20 h-1 bg-gradient-to-r from-[#0f5132] to-[#1a7042] mb-6"></div>
                                                            <p className={`text-base md:text-lg ${theme.textSecondary} leading-relaxed`}>
                                                                {attraction.description}
                                                            </p>
                                                        </div>
                                                        {/* Google Maps Button */}
                                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                                            <a
                                                                href={getGoogleMapsUrl()}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f5132] text-white font-semibold rounded-full hover:bg-[#136640] transition-all duration-300 shadow-lg hover:shadow-xl"
                                                            >
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                                </svg>
                                                                View on Google Maps
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </section>
                    )}

                    
                    {/* Reviews Section */}
                    <section>
                        <h2 className={`group ${sectionTitleStyle}`}>
                            <Quote className={`inline-block mr-3 mb-1 ${iconStyle}`} /> What Our Guests Say
                        </h2>
                        <div className="w-full overflow-hidden" >
                           <div className="flex gap-4 animate-[auto-scroll-bobbing-reverse_90s_linear_infinite] hover:[animation-play-state:paused]" >
                                {reviews.length > 0 ? [...reviews, ...reviews].map((review, index) => (
                                    <div key={`${review.id}-${index}`} className={`group flex-none w-80 md:w-96 ${theme.bgCard} rounded-2xl p-4 shadow-2xl border ${theme.border}`} >
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
                <button onClick={scrollToTop} className={`fixed bottom-8 right-8 p-3 rounded-full ${theme.buttonBg} ${theme.buttonText} shadow-lg transition-all duration-300 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} aria-label="Back to Top">
                    <ChevronUp className="w-6 h-6" />
                </button>

                <button onClick={toggleChat} className={`fixed bottom-8 left-8 p-4 rounded-full ${theme.buttonBg} ${theme.buttonText} shadow-lg transition-all duration-300 z-50 ${theme.buttonHover}`} aria-label="Open Chat">
                    <MessageSquare className="w-6 h-6" />
                </button>

                {/* AI Concierge Chat Modal */}
                {isChatOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-end justify-center">
                        <div className={`w-full max-w-lg h-3/4 md:h-4/5 ${theme.chatBg} rounded-t-3xl shadow-2xl flex flex-col`}>
                            <div className={`${theme.chatHeaderBg} p-4 rounded-t-3xl flex items-center justify-between border-b ${theme.chatInputBorder}`}>
                                <h3 className="text-lg font-bold flex items-center"><MessageSquare className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> AI Concierge</h3>
                                <button onClick={toggleChat} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <div ref={chatMessagesRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-xl max-w-xs md:max-w-md shadow-lg ${msg.role === 'user' ? `${theme.chatUserBg} ${theme.chatUserText} rounded-br-none` : `${theme.chatModelBg} ${theme.chatModelText} rounded-bl-none`}`}>
                                            <p className="text-sm break-words">{msg.parts[0].text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className={`p-3 rounded-xl ${theme.chatModelBg} shadow-lg`}>
                                            <div className="flex items-center space-x-2 animate-bounce-dot">
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0s' }}></div>
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0.2s' }}></div>
                                                <div className={`w-2 h-2 ${theme.chatLoaderBg} rounded-full`} style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleSendMessage} className={`p-4 border-t ${theme.chatInputBorder} ${theme.chatHeaderBg} flex items-center`}>
                                <input type="text" value={userMessage} onChange={(e) => setUserMessage(e.target.value)} placeholder="Ask me anything..."
                                    className={`flex-1 p-3 rounded-full ${theme.chatInputBg} ${theme.textPrimary} ${theme.chatInputPlaceholder} focus:outline-none focus:ring-2 focus:ring-[#0f5132]`} />
                                <button type="submit" className={`ml-2 p-3 rounded-full ${theme.buttonBg} ${theme.buttonText} ${theme.buttonHover} transition-colors disabled:opacity-50`} disabled={!userMessage.trim() || isChatLoading}>
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                
                {/* General Booking Modal - Date Selection First */}
                {isGeneralBookingOpen && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className={`w-full max-w-md ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col`}>
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className="text-lg font-bold flex items-center"><BedDouble className={`w-5 h-5 mr-2 ${theme.textAccent}`} /> Select Your Dates</h3>
                                <button onClick={() => setIsGeneralBookingOpen(false)} className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className={`${theme.textSecondary} text-center mb-4`}>Select your check-in and check-out dates to view available rooms</p>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Check-in Date</label>
                                        <input 
                                            type="date" 
                                            name="check_in" 
                                            value={bookingData.check_in} 
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
                                            value={bookingData.check_out} 
                                            onChange={handleRoomBookingChange} 
                                            min={bookingData.check_in || new Date().toISOString().split('T')[0]} 
                                            required 
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} 
                                        />
                                    </div>
                                </div>
                                {bookingData.check_in && bookingData.check_out && (
                                    <div className="pt-4 space-y-3 border-t border-gray-200 dark:border-neutral-700">
                                        <p className={`text-sm ${theme.textSecondary} text-center`}>Continue with booking:</p>
                                <button 
                                    onClick={() => { setIsGeneralBookingOpen(false); setIsRoomBookingFormOpen(true); }}
                                    className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors flex items-center justify-center space-x-2`}
                                >
                                    <BedDouble className="w-5 h-5" />
                                    <span>Book a Room</span>
                                </button>
                                <button 
                                            onClick={() => { 
                                                setIsGeneralBookingOpen(false);
                                                // Copy dates from bookingData to packageBookingData
                                                setPackageBookingData(prev => ({ 
                                                    ...prev,
                                                    check_in: bookingData.check_in || prev.check_in || '',
                                                    check_out: bookingData.check_out || prev.check_out || ''
                                                }));
                                                setIsPackageSelectionOpen(true); 
                                            }}
                                    className={`w-full py-3 rounded-full ${theme.buttonBg} ${theme.buttonText} font-bold shadow-lg ${theme.buttonHover} transition-colors flex items-center justify-center space-x-2`}
                                >
                                    <Package className="w-5 h-5" />
                                    <span>Book a Package</span>
                                </button>
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
                                                    className={`rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden ${bookingData.room_ids.includes(room.id) ? `${theme.buttonBg} ${theme.buttonText} border-transparent` : `${theme.bgCard} ${theme.textPrimary} ${theme.border} hover:border-[#0f5132]`}`}
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
                                            <div className="col-span-full text-center py-8" style={{ color: '#0f5132' }}>
                                                        <BedDouble className="w-12 h-12 mx-auto mb-3" style={{ color: '#0f5132' }} />
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
                                    <input type="text" name="guest_name" value={bookingData.guest_name} onChange={handleRoomBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={bookingData.guest_email} onChange={handleRoomBookingChange} placeholder="user@example.com" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={bookingData.guest_mobile} onChange={handleRoomBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Adults</label>
                                        <input type="number" name="adults" value={bookingData.adults} onChange={handleRoomBookingChange} min="1" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Children</label>
                                        <input type="number" name="children" value={bookingData.children} onChange={handleRoomBookingChange} min="0" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
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
                                <button
                                    onClick={() => {
                                        setIsPackageBookingFormOpen(false);
                                        setSelectedPackage(null);
                                    }}
                                    className={`p-1 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}
                                >
                                    <X className="w-6 h-6" />
                                </button>
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
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} 
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
                                            className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Available Rooms for Selected Dates</label>
                                    {selectedPackage?.is_full_property ? (
                                        <div className="p-6 text-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                                            <BedDouble className="w-10 h-10 mx-auto mb-3" />
                                            <p className="text-sm font-semibold">Full property package selected</p>
                                            <p className="text-xs mt-1">All rooms will be reserved automatically for these dates.</p>
                                        </div>
                                    ) : !packageBookingData.check_in || !packageBookingData.check_out ? (
                                        <div className={`p-6 text-center rounded-xl ${theme.bgSecondary} border-2 border-dashed ${theme.border}`}>
                                            <BedDouble className={`w-10 h-10 ${theme.textSecondary} mx-auto mb-3`} />
                                            <p className={`text-sm ${theme.textSecondary}`}>Please select check-in and check-out dates above to see available rooms</p>
                                        </div>
                                    ) : (
                                        <>
                                            {selectedPackage?.room_type && (
                                                <p className={`text-xs ${theme.textSecondary} mb-2`}>Showing {selectedPackage.room_type} rooms available from {packageBookingData.check_in} to {packageBookingData.check_out}</p>
                                            )}
                                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-3 rounded-xl ${theme.bgSecondary}`}>
                                                {packageAvailableRooms.length > 0 ? (
                                                    packageAvailableRooms.map(room => {
                                                        const isAvailable = Object.keys(packageRoomAvailability).length === 0 || packageRoomAvailability[room.id] !== false;
                                                        return (
                                                            <div
                                                                key={room.id}
                                                                onClick={() => isAvailable && handlePackageRoomSelection(room.id)}
                                                                className={`rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                                                                    !isAvailable
                                                                        ? 'opacity-50 cursor-not-allowed bg-gray-300 border-gray-400'
                                                                        : `cursor-pointer ${packageBookingData.room_ids.includes(room.id) ? `${theme.buttonBg} ${theme.buttonText} border-transparent` : `${theme.bgCard} ${theme.textPrimary} ${theme.border} hover:border-[#0f5132]`}`
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
                                                                    <p className="text-xs opacity-80">{room.type || 'Standard'}</p>
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
                                                    <div className="col-span-full text-center py-8" style={{ color: '#0f5132' }}>
                                                        <BedDouble className="w-12 h-12 mx-auto mb-3" style={{ color: '#0f5132' }} />
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
                                    <input type="text" name="guest_name" value={packageBookingData.guest_name} onChange={handlePackageBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={packageBookingData.guest_email || ''} onChange={handlePackageBookingChange} placeholder="user@example.com (optional)" className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={packageBookingData.guest_mobile} onChange={handlePackageBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Adults</label>
                                        <input type="number" name="adults" value={packageBookingData.adults} onChange={handlePackageBookingChange} min="1" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <label className={`block text-sm font-medium ${theme.textSecondary}`}>Children</label>
                                        <input type="number" name="children" value={packageBookingData.children} onChange={handlePackageBookingChange} min="0" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
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
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {pkg.is_full_property && (
                                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                                                                    Full Property
                                                                </span>
                                                            )}
                                                            {pkg.room_type && !pkg.is_full_property && (
                                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 uppercase tracking-wide">
                                                                    {pkg.room_type} Rooms
                                                                </span>
                                                            )}
                                                        </div>
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
                                    <input type="text" name="guest_name" value={serviceBookingData.guest_name} onChange={handleServiceBookingChange} placeholder="Enter your full name" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Email Address</label>
                                    <input type="email" name="guest_email" value={serviceBookingData.guest_email} onChange={handleServiceBookingChange} placeholder="user@example.com" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Phone Number</label>
                                    <input type="tel" name="guest_mobile" value={serviceBookingData.guest_mobile} onChange={handleServiceBookingChange} placeholder="Enter your mobile number" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-sm font-medium ${theme.textSecondary}`}>Room ID (Optional)</label>
                                    <input type="number" name="room_id" value={serviceBookingData.room_id || ''} onChange={handleServiceBookingChange} placeholder="Enter your room ID if assigned" className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
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
                                    <input type="number" name="room_id" value={foodOrderData.room_id || ''} onChange={(e) => setFoodOrderData(prev => ({ ...prev, room_id: parseInt(e.target.value) || '' }))} placeholder="Enter your room ID" required className={`w-full p-3 rounded-xl ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132] transition-colors`} />
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
                                                className={`w-20 p-2 text-center rounded-lg ${theme.bgSecondary} ${theme.textPrimary} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-[#0f5132]`}
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
                
                {/* Food Details Modal */}
                {isFoodDetailsOpen && selectedFoodItem && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className={`w-full max-w-4xl ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-8`}>
                            {/* Header */}
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className={`text-2xl font-bold ${theme.textPrimary}`}>Food Details</h3>
                                <button 
                                    onClick={() => {
                                        setIsFoodDetailsOpen(false);
                                        setSelectedFoodItem(null);
                                    }} 
                                    className={`p-2 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Image Section */}
                                    <div className="w-full md:w-1/2">
                                        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
                                            <img 
                                                src={process.env.NODE_ENV === 'production' 
                                                    ? `https://www.teqmates.com/${selectedFoodItem.images?.[0]?.image_url}` 
                                                    : `http://localhost:8000/${selectedFoodItem.images?.[0]?.image_url}`} 
                                                alt={selectedFoodItem.name} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                            />
                                            {/* Availability Badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${selectedFoodItem.available ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                                    {selectedFoodItem.available ? "Available" : "Unavailable"}
                                                </span>
                                            </div>
                                            {/* Category Badge */}
                                            {foodCategories.length > 0 && selectedFoodItem.category_id && (() => {
                                                const category = foodCategories.find(cat => cat.id === selectedFoodItem.category_id);
                                                return category ? (
                                                    <div className="absolute top-4 left-4">
                                                        <span className="px-4 py-2 bg-[#0f5132] text-white text-sm font-bold rounded-full shadow-lg">
                                                            {category.name}
                                                        </span>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                        
                                        {/* Image Gallery if multiple images */}
                                        {selectedFoodItem.images && selectedFoodItem.images.length > 1 && (
                                            <div className="mt-4 grid grid-cols-4 gap-2">
                                                {selectedFoodItem.images.slice(0, 4).map((img, index) => (
                                                    <div key={index} className="relative h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                                                        <img 
                                                            src={process.env.NODE_ENV === 'production' 
                                                                ? `https://www.teqmates.com/${img.image_url}` 
                                                                : `http://localhost:8000/${img.image_url}`} 
                                                            alt={`${selectedFoodItem.name} ${index + 1}`} 
                                                            className="w-full h-full object-cover" 
                                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Details Section */}
                                    <div className="w-full md:w-1/2 flex flex-col">
                                        <h2 className={`text-3xl font-extrabold ${theme.textPrimary} mb-4`}>
                                            {selectedFoodItem.name}
                                        </h2>
                                        
                                        {/* Category */}
                                        {foodCategories.length > 0 && selectedFoodItem.category_id && (() => {
                                            const category = foodCategories.find(cat => cat.id === selectedFoodItem.category_id);
                                            return category ? (
                                                <div className="mb-4">
                                                    <span className="inline-block px-4 py-2 bg-green-100 text-[#0f5132] text-sm font-semibold rounded-full">
                                                        {category.name}
                                                    </span>
                                                </div>
                                            ) : null;
                                        })()}
                                        
                                        {/* Divider */}
                                        <div className="w-20 h-1 bg-gradient-to-r from-[#0f5132] to-[#1a7042] mb-6"></div>
                                        
                                        {/* Description */}
                                        <div className="mb-6">
                                            <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-2`}>Description</h3>
                                            <p className={`text-base ${theme.textSecondary} leading-relaxed`}>
                                                {selectedFoodItem.description || 'No description available.'}
                                            </p>
                                        </div>
                                        
                                        {/* Availability Status */}
                                        <div className="mt-auto pt-6 border-t border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedFoodItem.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {selectedFoodItem.available ? "✓ Currently Available" : "✗ Currently Unavailable"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Package Details Modal */}
                {isPackageDetailsModalOpen && selectedPackageDetails && (
                    <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className={`w-full max-w-6xl ${theme.bgCard} rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-8`}>
                            {/* Header */}
                            <div className={`p-6 flex items-center justify-between border-b ${theme.border}`}>
                                <h3 className={`text-2xl font-bold ${theme.textPrimary}`}>Package Details</h3>
                                <button 
                                    onClick={() => {
                                        setIsPackageDetailsModalOpen(false);
                                        setSelectedPackageDetails(null);
                                    }} 
                                    className={`p-2 rounded-full ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Image Section */}
                                    <div className="w-full lg:w-1/2">
                                        {/* Main Image */}
                                        <div className="relative h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden mb-4">
                                            <img 
                                                src={selectedPackageDetails.images && selectedPackageDetails.images.length > 0 
                                                    ? getImageUrl(selectedPackageDetails.images[packageImageIndex[selectedPackageDetails.id] || 0]?.image_url) 
                                                    : ITEM_PLACEHOLDER} 
                                                alt={selectedPackageDetails.title} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                            />
                                            {/* Price Badge */}
                                            <div className="absolute bottom-4 left-4 bg-white/95 text-[#0f5132] font-extrabold text-2xl md:text-3xl px-4 py-2 rounded-xl shadow-lg">
                                                {formatCurrency(selectedPackageDetails.price || 0)}
                                            </div>
                                            {/* Image Navigation */}
                                            {selectedPackageDetails.images && selectedPackageDetails.images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            const currentIdx = packageImageIndex[selectedPackageDetails.id] || 0;
                                                            const prevIdx = currentIdx === 0 ? selectedPackageDetails.images.length - 1 : currentIdx - 1;
                                                            setPackageImageIndex(prev => ({ ...prev, [selectedPackageDetails.id]: prevIdx }));
                                                        }}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-[#0f5132] p-2 rounded-full shadow-lg hover:bg-white transition-all"
                                                    >
                                                        <ChevronRight className="w-5 h-5 rotate-180" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const currentIdx = packageImageIndex[selectedPackageDetails.id] || 0;
                                                            const nextIdx = currentIdx === selectedPackageDetails.images.length - 1 ? 0 : currentIdx + 1;
                                                            setPackageImageIndex(prev => ({ ...prev, [selectedPackageDetails.id]: nextIdx }));
                                                        }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-[#0f5132] p-2 rounded-full shadow-lg hover:bg-white transition-all"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full z-10">
                                                        {selectedPackageDetails.images.map((_, imgIdx) => (
                                                            <button
                                                                key={imgIdx}
                                                                onClick={() => setPackageImageIndex(prev => ({ ...prev, [selectedPackageDetails.id]: imgIdx }))}
                                                                className={`w-2 h-2 rounded-full transition-all ${imgIdx === (packageImageIndex[selectedPackageDetails.id] || 0) ? 'bg-white' : 'bg-white/40'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        
                                        {/* Image Gallery Thumbnails */}
                                        {selectedPackageDetails.images && selectedPackageDetails.images.length > 1 && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {selectedPackageDetails.images.map((img, index) => (
                                                    <div 
                                                        key={index} 
                                                        onClick={() => setPackageImageIndex(prev => ({ ...prev, [selectedPackageDetails.id]: index }))}
                                                        className={`relative h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border-2 ${index === (packageImageIndex[selectedPackageDetails.id] || 0) ? 'border-[#0f5132]' : 'border-transparent'}`}
                                                    >
                                                        <img 
                                                            src={getImageUrl(img.image_url)} 
                                                            alt={`${selectedPackageDetails.title} ${index + 1}`} 
                                                            className="w-full h-full object-cover" 
                                                            onError={(e) => { e.target.src = ITEM_PLACEHOLDER; }} 
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Details Section */}
                                    <div className="w-full lg:w-1/2 flex flex-col">
                                        <h2 className={`text-3xl md:text-4xl font-extrabold ${theme.textPrimary} mb-4`}>
                                            {selectedPackageDetails.title}
                                        </h2>
                                        
                                        {/* Badges */}
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            {selectedPackageDetails.is_full_property && (
                                                <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                                                    Full Property
                                                </span>
                                            )}
                                            {selectedPackageDetails.room_type && !selectedPackageDetails.is_full_property && (
                                                <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-green-100 text-green-700 uppercase tracking-wide">
                                                    {selectedPackageDetails.room_type} Rooms
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Divider */}
                                        <div className="w-20 h-1 bg-gradient-to-r from-[#0f5132] to-[#1a7042] mb-6"></div>
                                        
                                        {/* Description */}
                                        <div className="mb-6">
                                            <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-2`}>Description</h3>
                                            <p className={`text-base ${theme.textSecondary} leading-relaxed`}>
                                                {selectedPackageDetails.description || 'No description available.'}
                                            </p>
                                        </div>
                                        
                                        {/* Price Section */}
                                        <div className="mb-6 pt-4 border-t border-gray-200">
                                            <p className="text-sm mb-2" style={{ color: '#0f5132' }}>Starting from</p>
                                            <p className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#0f5132' }}>
                                                {formatCurrency(selectedPackageDetails.price || 0)}
                                                <span className="text-lg font-normal ml-2" style={{ color: '#0f5132' }}>/package</span>
                                            </p>
                                        </div>
                                        
                                        {/* Booking Button */}
                                        <div className="mt-auto pt-6 border-t border-gray-200">
                                            <button
                                                onClick={() => {
                                                    setIsPackageDetailsModalOpen(false);
                                                    handleOpenPackageBookingForm(selectedPackageDetails.id);
                                                }}
                                                className="w-full px-8 py-4 bg-[#0f5132] text-white font-bold text-lg rounded-md border-2 border-[#0f5132] hover:bg-[#136640] transition-all duration-300"
                                                style={{ color: '#ffffff' }}
                                            >
                                                <span className="flex items-center justify-center gap-2" style={{ color: '#ffffff' }}>
                                                    Book Now
                                                    <ChevronRight className="w-5 h-5" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <footer className="bg-white py-8 px-4 md:px-12 mt-12 border-t border-gray-200">
                    <div className="container mx-auto">
                        {resortInfo && (
                            <>
                                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6">
                                    <div className="text-center md:text-left">
                                        <h3 className="text-xl font-bold tracking-tight" style={{ color: '#0f5132' }}>{resortInfo.name}</h3>
                                        <p className="text-sm mt-1" style={{ color: '#0f5132' }}>{resortInfo.address}</p>
                                        <p className="text-xs mt-2" style={{ color: '#0f5132' }}>&copy; 2024 Pomma Holidays. TeqMates.</p>
                                    </div>
                                    <div className="flex space-x-4">
                                        <a href={formatUrl(resortInfo.facebook)} target="_blank" rel="noopener noreferrer" className="text-[#0f5132] hover:text-[#136640] transition-colors"><Facebook /></a>
                                        <a href={formatUrl(resortInfo.instagram)} target="_blank" rel="noopener noreferrer" className="text-[#0f5132] hover:text-[#136640] transition-colors"><Instagram /></a>
                                        <a href={formatUrl(resortInfo.twitter)} target="_blank" rel="noopener noreferrer" className="text-[#0f5132] hover:text-[#136640] transition-colors"><Twitter /></a>
                                        <a href={formatUrl(resortInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="text-[#0f5132] hover:text-[#136640] transition-colors"><Linkedin /></a>
                                    </div>
                                </div>
                                {/* Powered by TeqMates - Centered */}
                                <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
                                    <span className="text-xs" style={{ color: '#0f5132' }}>Powered by</span>
                                    <a href="https://teqmates.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                                        <span className="text-sm font-bold" style={{ color: '#0f5132' }}>TeqMates</span>
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </footer>
            </div>
        </>
    );
}