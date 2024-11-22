declare module 'clsx' {
  export type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[]
  export default function clsx(...inputs: ClassValue[]): string
}

declare module 'omniaural' {
  const OmniAural: any
  export const useOmniAural: any
  export const useOmniAuralEffect: any
  export default OmniAural
}

declare module 'next-i18next' {
  export const useTranslation: any
}

declare module 'tailwind-merge' {
  export function twMerge(...inputs: (string | undefined)[]): string
}

declare module '@radix-ui/react-aspect-ratio' {
  export const Root: React.FC<{ ratio?: number; children?: React.ReactNode }>
}

declare module 'framer-motion' {
  export const motion: {
    div: any;
    span: any;
    // Add other elements as needed
  };
  export type Variants = {
    [key: string]: {
      [key: string]: any;
    };
  };
} 