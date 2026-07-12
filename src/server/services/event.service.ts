import { EventRepository } from "../repositories/event.repository";

export class EventService {
  private repo = new EventRepository();

  async getEvent(id: string) {
    return this.repo.findById(id);
  }

  async getUpcoming(sportSlug?: string, limit = 50) {
    return this.repo.findUpcoming(sportSlug, limit);
  }

  async getLive() {
    return this.repo.findLive();
  }

  async getStats() {
    const [totalEvents, upcomingEvents, liveEvents] = await Promise.all([
      this.repo.count(),
      this.repo.countByStatus("UPCOMING"),
      this.repo.countByStatus("LIVE"),
    ]);
    return { totalEvents, upcomingEvents, liveEvents };
  }
}
