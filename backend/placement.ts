import {CalendarEvent, CalendarOpenSpacing} from "./calendar";


export function in_minutes(time: Date) {
    return time.getHours() * 60 + time.getMinutes();
}
function minutesToMillis(minutes: number): number {
    return minutes * 60000;
}


function getTimeInDay(dayDate: Date, timeStartInMinutes: number, paddingInMinutes: number): Date {
    return new Date(
        dayDate.getTime()
        + minutesToMillis(timeStartInMinutes)
        + minutesToMillis(paddingInMinutes)
    );
}


export function isEventPossible(cEnd: number, nStart: number, duration: number): boolean {
    return nStart - cEnd >= duration;
}


export function appendPossible(
    existingPossibleStarts: CalendarOpenSpacing[],
    space: number,
    dayDate: Date,
    spaceStart: number,
    task_name: string,
    durationInMinutes: number
): void {
    const startTime = getTimeInDay(dayDate, spaceStart, 15);

    const newEvent: CalendarEvent = {
        title: task_name,
        startTime,
        durationInMinutes
    }

    existingPossibleStarts.push({
        space, event: newEvent
    });

}
