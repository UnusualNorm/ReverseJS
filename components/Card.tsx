interface CardProps {
  icon: string;
  title: string;
  description: string;
}

// A Card that has two collumns
// The first collumn is just an Icon (Emoji)
// The second collumn as two rows, a Title at the top, and a Description at the bottom
// It will have a shadow and a border radius
export default function Card({ icon, title, description }: CardProps) {
  return (
    <div class="flex flex-col p-4 mx-auto max-w-screen-md bg-white rounded-lg shadow">
      <div class="flex flex-row">
        <div class="flex flex-col items-center justify-center w-16 h-16 text-2xl text-white bg-blue-500 rounded-full">
          {icon}
        </div>
        <div class="flex flex-col ml-4">
          <div class="text-xl font-bold">{title}</div>
          <div class="mt-2 text-gray-500">{description}</div>
        </div>
      </div>
    </div>
  );
}
