const { DashboardSchema, SensorSchema } = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../errors");

const Dashboard = DashboardSchema;
const Sensor = SensorSchema;

const getAllDashboard = async (req, res) => {
  const userId = req.user.userId;
  const dashboards = await Dashboard.findAll({
    where: { userId: userId },
    include: [
      {
        model: Sensor,
        as: "sensor",
        attributes: ["type"]
      }
    ]
  });

  const formattedDashboards = dashboards.map((dashboard) => {
    const dashboardData = dashboard.toJSON();
    return {
      id: dashboardData.id,
      userId: dashboardData.userId,
      sensorId: dashboardData.sensorId,
      name: dashboardData.name,
      control: dashboardData.control,
      type: dashboardData.type,
      createdAt: dashboardData.createdAt,
      updatedAt: dashboardData.updatedAt,
      sensorType: dashboardData.sensor ? dashboardData.sensor.type : null
    };
  });

  res
    .status(StatusCodes.OK)
    .json({ dashboards: formattedDashboards, count: dashboards.length });
};

const getDashboard = async (req, res) => {
  const dashboardId = req.params.id;
  const dashboard = await Dashboard.findByPk(dashboardId);

  if (dashboard) {
    if (dashboard.userId !== req.user.userId) {
      throw new ForbiddenError("No allow to get other user dashboard");
    }
    res.status(StatusCodes.OK).json({
      dashboard: {
        dashboardId: dashboard.id,
        userId: dashboard.userId,
        sensorId: dashboard.sensorId,
        name: dashboard.name,
        control: dashboard.control,
        type: dashboard.type
      }
    });
  } else {
    throw new NotFoundError(`No dashboard with id ${dashboardId}`);
  }
};

const addDashboard = async (req, res) => {
  const { userId, sensorId, name, control, type } = req.body;

  const sensor = await Sensor.findByPk(sensorId);

  if (!sensor) {
    throw new BadRequestError("Invalid sensor ID");
  }

  const finalControl =
    sensor.type === "Analog Input" || sensor.type === "Digital Input"
      ? false
      : control;

  const dashboard = await Dashboard.create({
    userId: userId,
    sensorId: sensorId,
    name: name,
    control: finalControl,
    type: type
  });

  if (dashboard) {
    res.status(StatusCodes.CREATED).json({
      dashboard: {
        dashboardId: dashboard.id,
        userId: dashboard.userId,
        sensorId: dashboard.sensorId,
        name: dashboard.name,
        control: dashboard.control,
        type: dashboard.type
      }
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
    params: { id: dashboardId }
  } = req;

  // if (
  //   !userId ||
  //   !sensorId ||
  //   !name ||
  //   control === null ||
  //   control === undefined ||
  //   !type
  // ) {
  //   throw new BadRequestError("Please provide all values");
  // }

  if (req.user.userId !== userId) {
    console.log(req.user.userId);
    console.log(userId);
    throw new ForbiddenError("No allow to update other user dashboard");
  }

  const dashboard = await Dashboard.findByPk(dashboardId);

  // dashboard.userId = userId;
  // dashboard.sensorId = sensorId;
  dashboard.name = name;
  // dashboard.control = control;
  // dashboard.type = type;

  await dashboard.save();

  res.status(StatusCodes.OK).json({
    dashboard: {
      dashboardId: dashboardId,
      userId: dashboard.userId,
      sensorId: dashboard.sensorId,
      name: dashboard.name,
      control: dashboard.control,
      type: dashboard.type
    }
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
      id: dashboardId
    }
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
  deleteDashboard
};
