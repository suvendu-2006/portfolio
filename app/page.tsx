import { Hero } from "@/components/hero";
import { ProofStrip } from "@/components/proof-strip";
import { Projects } from "@/components/projects";
import { Skills } from "@/components/skills";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <>
      <main id="main">
        <Hero />
        <ProofStrip />
        <Projects />
        <Skills />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
