import useCall from 'src/hooks/useCall';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import config from 'src/config';
import useNavigateAction from 'src/hooks/useNavigateAction';
import { isInt } from 'src/helpers';
import {
  InitialDataContext,
  IntervalContext,
  UserIdContext,
} from 'src/providers';

export function useGetProfessionalDetail(onSearchFinish) {
  const { call } = useCall((response) => {
    if (!response.data) {
      onSearchFinish(null);
      return;
    }
    onSearchFinish({
      ...response.data,
      reviews: response.data.reviews.map((review) => ({
        ...review,
        images: review.images
          ? review.images.slice(0, config.maxReviewImages)
          : null,
      })),
    });
  });
  const { loadUserId } = useContext(UserIdContext);
  return useCallback(
    (professionalId, reviewsPage = 1) => {
      const userId = loadUserId();
      call(config.api.endPointsURLs.getProfessionalDetail, [
        professionalId,
        reviewsPage,
        userId,
      ]);
    },
    [call],
  );
}

export default function useProfessionalDetail() {
  const [professionalDetail, setProfessionalDetail] = useState(null);
  const callGetProfessional = useGetProfessionalDetail(setProfessionalDetail);
  const { action, actionParams } = useNavigateAction();
  const { addSubscriber, removeSubscriber } = useContext(IntervalContext);
  const [professionalId, setProfessionalId] = useState(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [callId, setCallId] = useState(0);
  const { reviewsPerPage } = useContext(InitialDataContext);

  useEffect(() => {
    if (!action) {
      removeSubscriber('callGetProfessional');
      setProfessionalDetail(null);
      return;
    }
    if (action === 'add-review' || action === 'professional-detail') {
      const auxProfessionalId = isInt(actionParams)
        ? parseInt(actionParams, 10)
        : null;

      setProfessionalId(auxProfessionalId);
      if (auxProfessionalId) {
        // did this hack because I needed to call detail with current reviewsPage value
        addSubscriber('callGetProfessional', () => setCallId(Math.random));
      }
    }
  }, [action, actionParams]);

  useEffect(() => {
    if (professionalId) {
      callGetProfessional(professionalId, reviewsPage);
    }
  }, [callId, reviewsPage, professionalId]);

  return useMemo(
    () => ({
      professionalDetail,
      setProfessionalDetail,
      reviewsPage,
      nextPage: () => {
        setReviewsPage((prevPage) => {
          if (
            Math.abs(
              professionalDetail.reviewsCount - reviewsPerPage * (prevPage + 1),
            ) < reviewsPerPage
          ) {
            return prevPage + 1;
          }
          return prevPage;
        });
      },
    }),
    [professionalDetail, reviewsPage, reviewsPerPage],
  );
}
