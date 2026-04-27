const catchAsync = (controller) => async (req, res, next) => {
  try {
    controller(req, res, next);
  } catch (error) {
    next(error);
  }
};
export default catchAsync;
