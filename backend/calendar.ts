export type CalendarEvent = {
    title: string;
    startTime: Date;
    durationInMinutes: number;
}

export type CalendarOpenSpacing = {
    space: number; //margin is the difference between the end of the previous event and the start of the next event
    event: CalendarEvent;
};

type CalendarDay = {
    date: Date;
    events: CalendarEvent[];
}

export type CalendarWeek = FixedLengthArray<[CalendarDay, CalendarDay, CalendarDay, CalendarDay, CalendarDay, CalendarDay, CalendarDay]>


// source: https://stackoverflow.com/a/59906630/15788271
type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number
type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never
type FixedLengthArray<T extends any[]> =
    Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
    & { [Symbol.iterator]: () => IterableIterator<ArrayItems<T>> }
