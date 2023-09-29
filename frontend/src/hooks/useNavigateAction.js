import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { isInt } from 'src/helpers';

export default function useNavigateAction() {
  const navigate = useNavigate();
  const { action, actionParams: actionParamsStr } = useParams();

  const actionParams = useMemo(() => {
    if (isInt(actionParamsStr)) {
      return parseInt(actionParamsStr, 10);
    }
    return actionParamsStr ? `${actionParamsStr}` : null;
  }, [actionParamsStr]);

  return useMemo(
    () => ({
      action,
      actionParams,
      navigateAction: (actionN, actionParamsN = null) => {
        if (!actionN) {
          navigate('/');
          return;
        }
        navigate(
          `${actionParamsN ? `/${actionN}/${actionParamsN}` : `/${actionN}`}`,
        );
      },
    }),
    [action, actionParams],
  );
}
