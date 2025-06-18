import Button from "@/components/Button";

export default function Home() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-gradient-to-r from-amber-500 to-amber-200  bg-clip-text flex mx-auto flex-col gap-1 text-center mt-10">
        <h1 className="font-bold text-6xl text-transparent">Ninja Notes</h1>
        <p>The correct way to take notes</p>
      </div>
      <div className="flex justify-center gap-4">
        <Button label="Add Note" isPrimary></Button>
        <Button label="About"></Button>
      </div>
    </div>
  );
}
