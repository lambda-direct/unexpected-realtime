import type { Order } from "../types";
import type { RealtimeEvent } from "./types";

export const createSet = <T extends { id: number }>(_order: Order) => {
	let set: T[] = [];
	let order: Order = _order;

	return {
		get: (): T[] => set,
		set: (data: T[]) => {
			set = data;
		},
		update: (events: RealtimeEvent<T>[]) => {
			for (const event of events) {
				const elementIndex = set.findLastIndex((item) => {
					return order === 'asc'
						? item.id <= event.entityId
						: item.id >= event.entityId;
				});

				if (event.operation === "insert") {
					const index = order === 'asc' ? set.length - 1 : 0;
					set = set.toSpliced(index, 0, event.data);
				} else if (event.operation === "update") {
					set = set.toSpliced(elementIndex, 1, event.data);
				} else if (event.operation === "delete") {
					set = set.toSpliced(elementIndex, 1);
				}
			}
		},
		setOrder: (_order: Order) => {
			order = _order;
		},
	};
};
