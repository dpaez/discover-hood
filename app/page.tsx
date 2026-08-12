import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center w-full">
          <h1 className="text-5xl mb-4 font-semibold font-heading leading-10 tracking-tight text-black dark:text-zinc-50">
            Address Insights
          </h1>
          <ButtonGroup className="w-full max-w-2xl">
            <Input id="input-button-group" placeholder="Enter your address..." />
            <Button variant="outline">Search</Button>
          </ButtonGroup>
        </div> 
      </main>
    </div>
  );
}
