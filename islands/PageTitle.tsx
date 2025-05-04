import { useContext } from "preact/hooks";
import { SettingsContext } from "../contexts/SettingsContext.tsx";

interface PageTitleProps {
  // Accept a single key or an array of keys to join with spaces
  titleKey: string | string[];
  // Allow passing additional classes for styling
  class?: string;
}

export default function PageTitle({ titleKey, class: className = "" }: PageTitleProps) {
  const { t } = useContext(SettingsContext);
  const currentT = t.value;

  let title = "";
  if (Array.isArray(titleKey)) {
    title = titleKey.map(key => currentT[key as keyof typeof currentT] ?? key).join(" ");
  } else {
    title = currentT[titleKey as keyof typeof currentT] ?? titleKey;
  }

  // Determine heading level based on key or add a prop later if needed
  const Tag = titleKey === "home" ? "h1" : "h2"; // Example: h1 for home, h2 otherwise
  const defaultClasses = titleKey === "home"
    ? "text-3xl font-bold text-center mb-6"
    : "text-2xl font-semibold";

  return (
    <Tag class={`${defaultClasses} text-gray-800 dark:text-gray-200 ${className}`}>
      {title}
    </Tag>
  );
}