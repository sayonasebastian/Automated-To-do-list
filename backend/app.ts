import {PrismaClient} from "@prisma/client";
import express from "express";
import {getDuration} from "./ai";
import {CalendarOpenSpacing, CalendarWeek} from "./calendar";
import {appendPossible, in_minutes, isEventPossible} from "./placement";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.post("/user", async (req, res) => {
    const user = req.body;
    console.log(user);
    await prisma.user.create({data: user});
    res.json(user);
});

interface Event {
    summary: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
}

app.post("/calanderEvents", async (req, res) => {
    const allEvents: Event[] = req.body.events;
    console.log(allEvents);
    if (allEvents) {
        const filteredEvents = allEvents.map(({summary, start, end}) => ({
            summary,
            start: start.dateTime,
            end: end.dateTime,
        }));
        console.log(filteredEvents);
        res.status(200)
            .json({
                summary: "Test scheudl",
                start: "2024-02-27T14:45:00-05:00",
                end: "2024-02-27T15:45:00-05:00",
            });
    }
    // Push to DB
});


// gets the previous event and adds its durration to calculate the start time of the next event

app.get("/items/:userId", async (req, res) => {
    const {userId} = req.params;
    const todos = await prisma.todo.findMany({
        where: {
            userId: userId,
        },
    });
    res.json(todos);
});

app.post("/scheduleTask", async (req, res) => {

    const {task_name, week, userId}: { task_name: string; week: CalendarWeek, userId: string } = req.body;

    const duration = await getDuration(task_name);
    const paddedDuration = duration + 30; //todo come back here

    const defaultDayStart = 9 * 60;
    const defaultDayEnd = 17 * 60;

    const possibleStart: CalendarOpenSpacing[] = [];

    week.forEach((day) => {
        day.date = new Date(day.date);
        day.date.setHours(0, 0, 0, 0); // remove time from date

        day.events.forEach((event) => {
            event.startTime = new Date(event.startTime);
        });
    })

    for (const day of week) {
        for (const [i, eachEvent] of day.events.entries()) {
            const currentEventStart = in_minutes(eachEvent.startTime); // need this to be current end to compare it to next begin
            const currentEventEnd = currentEventStart + eachEvent.durationInMinutes;

            const placeInPossibleStarts = (newEventStart: number, spacing: number) => {
                appendPossible(possibleStart, spacing, day.date, newEventStart, task_name, duration);
            }

            if (i == 0 && isEventPossible(defaultDayStart, currentEventStart, paddedDuration)) {
                const spacing = currentEventStart - defaultDayStart;
                placeInPossibleStarts(defaultDayStart, spacing);
            }

            if (i + 1 != day.events.length) {
                const nextEventStart = in_minutes(day.events[i + 1].startTime);

                if (isEventPossible(currentEventEnd, nextEventStart, paddedDuration)) {
                    const spacing = nextEventStart - currentEventStart;
                    placeInPossibleStarts(currentEventEnd, spacing);
                }

            } else if (isEventPossible(currentEventEnd, defaultDayEnd, paddedDuration)) { // if the last event ends before the end of the day
                const spacing = defaultDayEnd - currentEventStart;
                placeInPossibleStarts(currentEventEnd, spacing);
            }
        }
    }

    if (possibleStart.length == 0) {
        return null;
    }

    const bestFit = possibleStart.reduce((min, curr) => {
        return min.space - curr.space < 0 ? min : curr;
    });

    await prisma.todo.create({
        data: {
            title: task_name,
            completed: false,
            userId: userId,
        }
    })

    res.json({
        title: task_name,
        startTime: bestFit.event.startTime,
        durationInMinutes: duration,
    })
});

app.listen(5001, () =>
    console.log("🚀 Server ready at: http://localhost:5001")
);
