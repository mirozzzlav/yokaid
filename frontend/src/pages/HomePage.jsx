import React, { useContext, useEffect } from 'react';
import { AuthContext } from 'src/providers';
import config from 'src/config';

export default function HomePage() {
  const { response, isAuthorized, authorizedCall } = useContext(AuthContext);

  useEffect(() => {
    authorizedCall('books');
  }, []);

  if (
    response.isReady &&
    response.calledEndPoint === config.api.endPoints.books &&
    isAuthorized
  ) {
    return response.data.map((book) => (
      <div key={book.title}>{`${book.title} - ${book.author}`}</div>
    ));
  }
  return isAuthorized ? <>Loading</> : <>NOT logged-in</>;
}
