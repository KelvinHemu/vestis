import { ModelProfile } from "@/features/models/components/ModelProfile";

/* ============================================
   Model Profile Page
   Displays individual model details
   Dynamic route with [modelId] parameter
   ============================================ */

interface ModelProfilePageProps {
  params: Promise<{
    modelId: string;
  }>;
}

export default async function ModelProfilePage({ params }: ModelProfilePageProps) {
  // In Next.js 15, params is a Promise that needs to be awaited
  const { modelId } = await params;
  
  return <ModelProfile modelId={modelId} />;
}
