import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, queryClient, updateEvent } from '../../utils/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({signal}) => fetchEvent({signal, id: params.id})
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    // ** Optimistic updating
    onMutate: async (data) => {
      // cancelling the ongoing refetch for the mentioned query key
      await queryClient.cancelQueries({ queryKey: ["events", { id: params.id }] });

      // Return the previous query data so that it can be used to handle in error cases.
      const previousData = queryClient.getQueryData(["events", { id: params.id }]);

      // Updating the data in the cache.
      queryClient.setQueryData(["events", { id: params.id }], data.event);

      return {previousData}
    },
    onError: (error, newEvent, context) => {
      // Rolling back to previous data if mutation function fails.
      queryClient.setQueryData(["events", { id: params.id }], context.previousData);
    },
    onSettled: () => {
      // Always refetch after success or failure to make sure that backend and UI are in sync, we invalidate the requests.
      // queryClient.invalidateQueries({ queryKey: ["events", {id: params.id}]})
    }
  })

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isPending) {
    content = (
      <div className='center'>
        <LoadingIndicator />
      </div>
    )
  }

  if (isError) { 
    content = (
      <div className='center'>
        <ErrorBlock
          title="Failed to load event"
          message={error.info?.message || 'Failed to load events. Please check your inputs and try again.'}
        />
        <div className='form-actions'>
          <Link to="../" className='button'>Okay</Link>
        </div>
      </div>
    )
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
