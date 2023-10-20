import useCall from 'src/hooks/useCall';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import config from 'src/config';
import useNavigateAction from 'src/hooks/useNavigateAction';
import { isInt } from 'src/helpers';
import { UserIdContext } from 'src/providers';

export function useGetProfessional(onSearchFinish) {
  const call = useCall((response) => {
    onSearchFinish(response.data ? response.data[0] : null);
  });
  const { loadUserId } = useContext(UserIdContext);
  return useCallback(
    (professionalId) => {
      const userId = loadUserId();
      call(
        `${config.api.endPointsURLs.getProfessionalDetail}/${professionalId}${
          userId ? `/${userId}` : ''
        }`,
      );
    },
    [call],
  );
}

export default function useProfessionalDetail() {
  const [professionalDetail, setProfessionalDetail] = useState(null);
  const callGetProfessional = useGetProfessional(setProfessionalDetail);
  const { action, actionParams } = useNavigateAction();
  const refreshInterval = useRef(null);

  useEffect(() => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = null;
    }
    if (!action) {
      setProfessionalDetail(null);
      return;
    }
    if (action === 'add-review' || action === 'professional-detail') {
      const professionalId = isInt(actionParams)
        ? parseInt(actionParams, 10)
        : null;

      if (professionalId) {
        callGetProfessional(professionalId);
        refreshInterval.current = setInterval(() => {
          callGetProfessional(professionalId);
        }, config.refreshInterval);
      }
    }
  }, [action, actionParams]);

  return [professionalDetail, setProfessionalDetail];
}
