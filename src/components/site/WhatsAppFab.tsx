import { CONTACT } from "@/lib/contact";

export function WhatsAppFab() {
  return (
    <a
      href={CONTACT.whatsappHref}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Chat with ${CONTACT.brand} on WhatsApp (${CONTACT.whatsappDisplay})`}
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_10px_30px_rgba(2,132,199,0.45)] transition-transform hover:scale-105 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M21.7 2.3a11 11 0 1 0-15.6 15.6L2 22l3.1-1.1A11 11 0 0 0 21.7 2.3z" />
        <path d="M17.4 14.3c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.3-.7.1-.8-.4-2.6-1.5-3.5-2.2-.6-.5-.6-.9-.1-1.2.6-.3 1.1-.8 1.3-1.1.2-.3.1-.5 0-.7-.1-.2-.7-1.7-1-2.3-.3-.6-.6-.5-.8-.5h-.8c-.3 0-.7.1-1 .5-.3.4-1 1.1-1 2.7 0 1.6 1 3.1 1.1 3.3.2.3 1.9 3.1 4.6 4.2 3 .1 3.3-1.3 3.6-1.4.3-.1.9-.3 1-.6.1-.3.1-.6.1-.7 0-.1-.1-.2-.4-.4z" />
      </svg>
    </a>
  );
}
