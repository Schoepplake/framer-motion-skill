import { EditorChrome } from "@/components/editor/EditorChrome";

export default function MissionEditorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return <EditorChrome id={params.id}>{children}</EditorChrome>;
}
