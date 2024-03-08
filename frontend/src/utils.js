export function dateDiffInDays(a, b) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

export async function listOfEvents() {
    return new Promise(async (resolve, reject) => {
        let response;
        try {
            const request = {
                'calendarId': 'primary',
                'timeMin': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 1000,
                'orderBy': 'startTime',
            };
            response = await window.gapi.client.calendar.events.list(request);
        } catch (error) {
            reject(error);
            return;
        }

        const all_events = response.result.items;
        if (!all_events || all_events.length === 0) {
            reject("error");
            return;
        }
        resolve(all_events);
    });
}

export function getWeeks(events) {
    const week = new Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);

        return {date, events: []};
    });

    for (const event of events.map(({summary, start, end}) => ({
        summary,
        startTime: start.dateTime,
        durationInMinutes: (new Date(end.dateTime) - new Date(start.dateTime)) / 1000 / 60
    }))) {
        const {startTime} = event;
        if (!startTime) {
            continue;
        }
        const i = dateDiffInDays(new Date(), new Date(startTime));
        if (i < 0 || i > 6) {
            break;
        }
        week[i].events.push(event);
    }
    return week;
}

function getEndFromStart(startTime, durationInMinutes) {
    const end = new Date(startTime);
    end.setMinutes(end.getMinutes() + durationInMinutes);
    return end;
}

export function getEvent(data, user) {
    return {
        "summary": data.title, "creator": {
            "email": user, "self": true
        }, "organizer": {
            "email": user, "self": true
        }, "start": {
            "dateTime": data.startTime,
            // "timeZone": "America/Kentucky/Monticello"
        }, "end": {
            "dateTime": getEndFromStart(data.startTime, data.durationInMinutes),
            // "timeZone": "America/Kentucky/Monticello"
        }, "reminders": {
            "useDefault": true
        }
    }
}
