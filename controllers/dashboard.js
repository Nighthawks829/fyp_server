const { DashboardSchema } = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../errors");

const Dashboard = DashboardSchema;

const getAllDashboard = async (req, res) => {
  const userId = req.params.id;
  const dashboards = await Dashboard.findAll({
    where: { userId: userId },
  });

  res.status(StatusCodes.OK).json({ dashboards, count: dashboards.length });
};

const getDashboard = async (req, res) => {
  const dashboardId = req.params.id;
  const dashboard = await Dashboard.findByPk(dashboardId);

  if (dashboard) {
    res.status(StatusCodes.OK).json({
      dashboard: {
        dashboardId: dashboard.id,
        userId: dashboard.userId,
        sensorId: dashboard.sensorId,
        name: dashboard.name,
        control: dashboard.control,
        type: dashboard.type,
      },
    });
  } else {
    throw new NotFoundError(`No dashboard with userId ${dashboardId}`);
  }
};

const addDashboard = async (req, res) => {
  const { userId, sensorId, name, control, type } = req.body;

  const dashboard = await Dashboard.create({
    userId: userId,
    sensorId: sensorId,
    name: name,
    control: control,
    type: type,
  });

  if (dashboard) {
    res.status(StatusCodes.CREATED).json({
      dashboard: {
        dashboardId: dashboard.id,
        userId: dashboard.userId,
        sensorId: dashboard.sensorId,
        name: dashboard.name,
        control: dashboard.control,
        type: dashboard.type,
      },
    });
  } else {
    throw new BadRequestError(
      "Unable to create new dashboard. Try again later"
    );
  }
};

const updateDashboard = async (req, res) => {
  const {
    body: { userId, sensorId, name, control, type },
    params: { id: dashboardId },
  } = req;

  if (
    !userId ||
    !sensorId ||
    !name ||
    control === null ||
    control === undefined ||
    !type
  ) {
    throw new BadRequestError("Please provide all values");
  }

  if (req.user.userId !== userId) {
    throw new ForbiddenError("No allow to update other user dashboard");
  }

  const dashboard = await Dashboard.findByPk(dashboardId);

  dashboard.userId = userId;
  dashboard.sensorId = sensorId;
  dashboard.name = name;
  dashboard.control = control;
  dashboard.type = type;

  await dashboard.save();

  res.status(StatusCodes.OK).json({
    dashboard: {
      dashboardId: dashboardId,
      userId: dashboard.userId,
      sensorId: dashboard.sensorId,
      name: dashboard.name,
      control: dashboard.control,
      type: dashboard.type,
    },
  });
};

const deleteDashboard = async (req, res) => {
  const dashboardId = req.params.id;
  const dashboardUserId = await Dashboard.findByPk(dashboardId);

  if (!dashboardUserId) {
    throw new NotFoundError(`No dashboard with id ${dashboardId}`);
  }

  if (dashboardUserId.userId !== req.user.userId) {
    throw new ForbiddenError("No allow to delete other user dashboard");
  }

  const dashboard = await Dashboard.destroy({
    where: {
      id: dashboardId,
    },
  });

  if (!dashboard) {
    throw new NotFoundError(`No dashboard with id ${dashboardId}`);
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: `Success delete dashboard ${dashboardId}` });
};

module.exports = {
  getAllDashboard,
  getDashboard,
  addDashboard,
  updateDashboard,
  deleteDashboard,
};
