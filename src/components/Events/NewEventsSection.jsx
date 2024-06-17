import { useQuery } from '@tanstack/react-query';

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import {fetchEvents} from "../../utils/http.js";

export default function NewEventsSection() {

  // * Using react-query is optional and we can also implement using useEffect and handle the API calls. But react-query gives out of the box features like caching and reloading content when moved to the browser tab.
  const { data, isPending, isError, error } = useQuery({
    queryFn: fetchEvents,
    queryKey: ['events'],
    // * Describes the time to trigger another request after the first request if cached data is present to keep sync with backend data.
    staleTime: 5000,
    // * cache validation time
    // gcTime: 5000 
  })

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch events!!'} />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
