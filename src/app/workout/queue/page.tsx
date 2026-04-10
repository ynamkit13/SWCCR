"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { warmUpSpeech } from "@/lib/speech";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
};

const defaultQueue: Exercise[] = [
  { id: "bicep-curls", name: "Bicep Curls", sets: 3, reps: 10, rest: 60 },
  { id: "lateral-raises", name: "Lateral Raises", sets: 3, reps: 12, rest: 45 },
  { id: "jumping-jacks", name: "Jumping Jacks", sets: 3, reps: 20, rest: 30 },
];

function SortableExercise({
  exercise,
  index,
  onUpdate,
  onRemove,
}: {
  exercise: Exercise;
  index: number;
  onUpdate: (index: number, field: "sets" | "reps" | "rest", value: number) => void;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-muted hover:text-foreground"
              aria-label="Drag to reorder"
            >
              ⠿
            </button>
            <h3
              className="font-semibold text-lg"
              data-testid="exercise-name"
            >
              {exercise.name}
            </h3>
          </div>
          <button
            onClick={() => onRemove(index)}
            className="p-1 text-error hover:text-red-700 cursor-pointer"
            aria-label="Remove"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label
              htmlFor={`sets-${index}`}
              className="block text-xs text-muted mb-1"
            >
              Sets
            </label>
            <input
              id={`sets-${index}`}
              type="number"
              min={1}
              value={exercise.sets}
              onChange={(e) => onUpdate(index, "sets", Number(e.target.value))}
              className="w-full rounded-lg border border-muted-light px-3 py-2 text-center text-base bg-background"
            />
          </div>
          <div>
            <label
              htmlFor={`reps-${index}`}
              className="block text-xs text-muted mb-1"
            >
              Reps
            </label>
            <input
              id={`reps-${index}`}
              type="number"
              min={1}
              value={exercise.reps}
              onChange={(e) => onUpdate(index, "reps", Number(e.target.value))}
              className="w-full rounded-lg border border-muted-light px-3 py-2 text-center text-base bg-background"
            />
          </div>
          <div>
            <label
              htmlFor={`rest-${index}`}
              className="block text-xs text-muted mb-1"
            >
              Rest (s)
            </label>
            <input
              id={`rest-${index}`}
              type="number"
              min={10}
              step={5}
              value={exercise.rest}
              onChange={(e) => onUpdate(index, "rest", Number(e.target.value))}
              className="w-full rounded-lg border border-muted-light px-3 py-2 text-center text-base bg-background"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function QueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState<Exercise[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recommended_exercises");
      if (saved) {
        const exercises = JSON.parse(saved);
        return exercises.map((e: { name: string; sets: number; reps: number; rest: number }) => ({
          id: e.name.toLowerCase().replace(/\s+/g, "-"),
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          rest: e.rest,
        }));
      }
    }
    return defaultQueue;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function updateExercise(
    index: number,
    field: "sets" | "reps" | "rest",
    value: number
  ) {
    const updated = [...queue];
    updated[index] = { ...updated[index], [field]: value };
    setQueue(updated);
  }

  function removeExercise(index: number) {
    setQueue(queue.filter((_, i) => i !== index));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQueue((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Your Workout
        </h1>
        <p className="text-muted text-sm">
          Drag to reorder. Customise your queue before starting.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={queue.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-4">
            {queue.map((exercise, i) => (
              <SortableExercise
                key={exercise.id}
                exercise={exercise}
                index={i}
                onUpdate={updateExercise}
                onRemove={removeExercise}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => router.back()} className="flex-1">
          Back
        </Button>
        <Button onClick={() => { warmUpSpeech(); router.push("/workout/session"); }} className="flex-1 text-lg py-4">Start Workout</Button>
      </div>
    </div>
  );
}
