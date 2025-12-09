
import { format as fnsFormat, formatDistanceToNow as fnsFormatDistanceToNow, isToday, isYesterday, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Utility for consistent date formatting across the application.
 * Uses pt-BR locale by default.
 */

const LOCALE = ptBR;

export const formatDate = (date: Date | string | number, formatStr: string = "dd 'de' MMMM 'de' yyyy"): string => {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(d)) return '';
    return fnsFormat(d, formatStr, { locale: LOCALE });
};

export const formatRelativeTime = (date: Date | string | number): string => {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(d)) return '';
    return fnsFormatDistanceToNow(d, { addSuffix: true, locale: LOCALE });
};

export const formatShortDate = (date: Date | string | number): string => {
    return formatDate(date, "dd/MM/yyyy");
}

export const formatTime = (date: Date | string | number): string => {
    return formatDate(date, "HH:mm");
}

export const keys = {
    isToday: (date: Date | string | number) => isToday(typeof date === 'string' ? parseISO(date) : new Date(date)),
    isYesterday: (date: Date | string | number) => isYesterday(typeof date === 'string' ? parseISO(date) : new Date(date)),
}
