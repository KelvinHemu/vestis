"use client";

interface ShopFooterProps {
  shopName: string;
}

export function ShopFooter({ shopName }: ShopFooterProps) {
  return (
    <footer className="border-t mt-auto bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {shopName}. Powered by Vestis</p>
      </div>
    </footer>
  );
}
