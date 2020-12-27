export class Queue<T> {
  private internal: T[] = [];

  push(item: T) {
    this.internal.push(item);
  }

  pop() {
    if (this.internal.length === 0) {
      throw new Error("Cannot pop empty queue");
    }

    const removed = this.internal.splice(0, 1);
    return removed[0];
  }
}
