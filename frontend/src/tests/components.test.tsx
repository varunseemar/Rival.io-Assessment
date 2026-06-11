import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatusBadge, PriorityBadge } from "@/components/Badge";
import { TaskCard } from "@/components/TaskCard";
import { formatDate, toDateInput } from "@/lib/format";
import { Task } from "@/lib/types";

const sampleTask: Task = {
  id: "1",
  title: "Write tests",
  description: "Cover the UI",
  status: "TODO",
  priority: "HIGH",
  dueDate: "2026-07-01T00:00:00.000Z",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
  userId: "u1",
};

describe("Badges", () => {
  it("renders a human-readable status label", () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("renders the priority label", () => {
    render(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });
});

describe("format helpers", () => {
  it("formats an ISO date and handles null", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate("2026-07-01T00:00:00.000Z")).toMatch(/2026/);
  });

  it("converts ISO to a date-input value", () => {
    expect(toDateInput("2026-07-01T00:00:00.000Z")).toBe("2026-07-01");
    expect(toDateInput(null)).toBe("");
  });
});

describe("TaskCard", () => {
  it("fires onToggleComplete when the checkbox is clicked", () => {
    const onToggle = vi.fn();
    render(
      <TaskCard
        task={sampleTask}
        onToggleComplete={onToggle}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    fireEvent.click(screen.getByLabelText("Mark complete"));
    expect(onToggle).toHaveBeenCalledWith(sampleTask);
  });

  it("shows the task title", () => {
    render(
      <TaskCard
        task={sampleTask}
        onToggleComplete={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText("Write tests")).toBeInTheDocument();
  });
});
