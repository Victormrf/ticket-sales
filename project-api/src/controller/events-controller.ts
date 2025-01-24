import { Router } from "express";
import { EventService } from "../services/event-service";

export const eventRoutes = Router();

const eventService = new EventService();

eventRoutes.get("/", async (req, res) => {
  const result = eventService.findAll();
  res.json(result);
});

eventRoutes.get("/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const event = eventService.findById(+eventId);

  if (!event) {
    res.status(404).json({ message: "Event not found" });
  }

  res.json(event);
});
