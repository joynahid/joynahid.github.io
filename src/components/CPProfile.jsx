const SolveCounts = [
  { name: "Codeforces", count: 1500, handle: "tux" },
  { name: "Atcoder", count: 100, handle: "joynahiid" },
  { name: "Spoj", count: 26, handle: "joynahiid" },
  { name: "LightOJ", count: 100, handle: "joynahid" },
  { name: "Codechef", count: 3, handle: "joy_nahiid" },
  { name: "UVA", count: 30, handle: "joynahiid" },
];

function CPProfile() {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {SolveCounts.map((item, index) => (
        <div key={index} className="flex justify-between items-center p-2 bg-base-200 rounded">
          <span className="font-medium">{item.name}</span>
          <span className="text-primary font-bold">{item.count}+</span>
        </div>
      ))}
    </div>
  );
}

export { CPProfile };
