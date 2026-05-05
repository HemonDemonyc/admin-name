import { useRoute } from "wouter";
import { useGetPublicLanding, getGetPublicLandingQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import LandingPageRenderer, { type LandingData } from "@/components/LandingPageRenderer";

export default function PublicLandingPage() {
  const [, params] = useRoute("/p/:username");
  const username = params?.username ?? "";

  const { data: landing, isLoading, isError } = useGetPublicLanding(username, {
    query: { queryKey: getGetPublicLandingQueryKey(username), enabled: !!username },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8">
        <Skeleton className="h-48 w-full max-w-lg" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }

  if (isError || !landing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl font-bold mb-2 text-muted-foreground">404</p>
          <p className="text-muted-foreground">Página não encontrada</p>
        </div>
      </div>
    );
  }

  const data: LandingData = {
    title: landing.title,
    subtitle: landing.subtitle,
    description: landing.description,
    buttonText: landing.buttonText,
    appFileObjectPath: landing.appFileObjectPath,
    tutorialVideoObjectPath: landing.tutorialVideoObjectPath,
    tutorialVideoUrl: landing.tutorialVideoUrl,
    logoObjectPath: landing.logoObjectPath,
    heroGradientFrom: landing.heroGradientFrom,
    heroGradientTo: landing.heroGradientTo,
    heroBgType: landing.heroBgType,
    heroBgColor: landing.heroBgColor,
    heroBgImageObjectPath: landing.heroBgImageObjectPath,
    heroTextDark: landing.heroTextDark,
    ctaBgColor: landing.ctaBgColor,
    ctaTextColor: landing.ctaTextColor,
    pageBgColor: landing.pageBgColor,
    pageTextColor: landing.pageTextColor,
    accentColor: landing.accentColor,
    photos: landing.photos as any,
    socialLinks: landing.socialLinks as any,
    sections: landing.sections as any,
  };

  return <LandingPageRenderer data={data} />;
}
