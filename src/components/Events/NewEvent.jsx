import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { createNewEvent } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function NewEvent() {
  const navigate = useNavigate();
  
  // * useMutation is used when we want to send data through http requests. It doesn't cache the responses.
  const { mutate, isError, error, isPending } = useMutation({
    mutationFn: createNewEvent
  })

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && "Submitting..."}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {
        isError &&
        <ErrorBlock title="Failed to create event" message={error.info?.message || 'Failed to create a event. Please check your inputs and try again later.'} />
      }
    </Modal>
  );
}
