import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";

import { AuthProvider } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Product from "@/pages/product";
import Game from "@/pages/game";
import Isletme from "@/pages/isletme";
import Wallet from "@/pages/wallet";
import Premium from "@/pages/premium";
import ReklamVer from "@/pages/reklam-ver";
import Siralama from "@/pages/siralama";
import Giris from "@/pages/giris";
import Kayit from "@/pages/kayit";
import VitrinProfil from "@/pages/vitrin-profil";
import Koleksiyonlar from "@/pages/koleksiyonlar";
import KoleksiyonDetay from "@/pages/koleksiyon-detay";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="/product/:id">
          {(params) => <Product id={params.id} />}
        </Route>
        <Route path="/oyun" component={Game} />
        <Route path="/isletme" component={Isletme} />
        <Route path="/cuzdan" component={Wallet} />
        <Route path="/premium" component={Premium} />
        <Route path="/reklam-ver" component={ReklamVer} />
        <Route path="/siralama" component={Siralama} />
        <Route path="/giris" component={Giris} />
        <Route path="/kayit" component={Kayit} />
        <Route path="/vitrin/:username">
          {(params) => <VitrinProfil username={params.username} />}
        </Route>
        <Route path="/koleksiyonlar" component={Koleksiyonlar} />
        <Route path="/koleksiyonlar/:username">
          {() => <Koleksiyonlar />}
        </Route>
        <Route path="/koleksiyon/:slug">
          {(params) => <KoleksiyonDetay slug={params.slug} />}
        </Route>
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider delayDuration={300}>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
