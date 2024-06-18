import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EventDetails() {

  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id: params["id"] }],
    queryFn: ({signal}) => fetchEvent({ id: params['id'], signal })
  });

  const { mutate, isError: isDeleteError, isPending: isDeletePending, error: deleteError} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        // * just invalidates the queries but doesn't perform refetch
        refetchType: 'none'
      });
      navigate('/events');
    }
  })

  function deleteHandler() {
    mutate({ id: params["id"] });    
  }

  let content = '';

  if (isPending) {
    return (
      <div id="event-details-content" className='center'>
        <p>Loading Event details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div id="event-details-content" className='center'>
        <ErrorBlock
          title="Error occurred!"
          message={error.info?.message || "Failed to fetch the event details."}
        />
      </div>
    );
  }
  
  const { date, description, image, location, time, title } = data;

  if (data) {
    
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })

    content = (
      <>
        <header>
          <h1>{title}</h1>
          <nav>
            <button onClick={deleteHandler}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
          {isDeleteError && (
            <ErrorBlock
              title="Error occurred!"
              message={deleteError || "Error occurred while deleting event"}
            />
          )}
          {isDeletePending && <p>Deleting...</p>}
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${image}`} alt={title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{location}</p>
              <time
                dateTime={`Todo-DateT$Todo-Time`}
              >{`${formattedDate} @ ${time}`}</time>
            </div>
            <p id="event-details-description">{description}</p>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        { content }
      </article>
    </>
  );
}
