const { DashboardSchema, SensorSchema } = require("../models/associations");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../errors");

const Dashboard = DashboardSchema;
const Sensor = SensorSchema;

/**
 * Get All Dashboards
 * 
 * Retrieves all dashboards for the authenticated user with associated sensor info
 * Sorts by dashboard type (DESC) and creation date (ASC)
 * Formats response to include sensor metadata
 */
const getAllDashboard = async (req, res) => {
  const userId = req.user.userId;

  // Fetch dashboards with sensor relationships
  const dashboards = await Dashboard.findAll({
    where: { userId: userId },
    include: [
      {
        model: Sensor,
        as: "sensor",
        attributes: ["type", "name"]    // Only include essential sensor info
      }
    ],
    order: [
      ["type", "DESC"],       // Primary sort by dashboard type
      ["createdAt", "ASC"]    // Secondary sort by creation time
    ]
  });

  // Transform response format
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
      sensorType: dashboardData.sensor ? dashboardData.sensor.type : null,
      sensorName: dashboardData.sensor ? dashboardData.sensor.name : null // Add sensor name
    };
  });

  res
    .status(StatusCodes.OK)
    .json({ dashboards: formattedDashboards, count: dashboards.length });
};

/**
 * Get Single Dashboard
 * 
 * Retrieves a specific dashboard by ID
 * Implements ownership check using JWT user ID
 * Returns 403 Forbidden for unauthorized access
 */
const getDashboard = async (req, res) => {
  const dashboardId = req.params.id;
  const dashboard = await Dashboard.findByPk(dashboardId);

  if (dashboard) {
    // Authorization check
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

/**
 * Create New Dashboard
 * 
 * Creates a dashboard with sensor relationship
 * Implements control logic based on sensor type:
 * - Input sensors (Analog/Digital) automatically disable control
 * - Other sensor types allow control setting
 */
const addDashboard = async (req, res) => {
  const { sensorId, name, control, type } = req.body;

  const userId = req.user.userId;

  // Validate sensor existence
  const sensor = await Sensor.findByPk(sensorId);
  if (!sensor) {
    throw new BadRequestError("Invalid sensor ID");
  }

  // Control logic based on sensor type
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

/**
 * Update Dashboard
 * 
 * Allows updating dashboard name only
 * Maintains security by:
 * - Checking user ownership
 * - Restricting updatable fields
 * - Returning complete dashboard state
 */
const updateDashboard = async (req, res) => {
  const {
    body: { sensorId, name, control, type },
    params: { id: dashboardId }
  } = req;

  if (!name) {
    throw new BadRequestError("Please provide all values");
  }

  const dashboard = await Dashboard.findByPk(dashboardId);

  if (dashboard) {
    // Ownership verification
    if (req.user.userId !== dashboard.userId) {
      throw new ForbiddenError("No allow to update other user dashboard");
    }

    // Update only allowed field
    dashboard.name = name;
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
  } else {
    throw new NotFoundError(`No dashboard with id ${req.params.id}`);
  }
};


/**
 * Delete Dashboard
 * 
 * Removes dashboard after verifying:
 * - Dashboard existence
 * - User ownership
 * Uses two-step verification for security
 */
const deleteDashboard = async (req, res) => {
  const dashboardId = req.params.id;
  const dashboardUserId = await Dashboard.findByPk(dashboardId);

  // First check ownership
  if (dashboardUserId) {
    if (dashboardUserId.userId !== req.user.userId) {
      throw new ForbiddenError("No allow to delete other user dashboard");
    }

    // Then perform deletion
    const dashboard = await Dashboard.destroy({
      where: {
        id: dashboardId
      }
    });
    res
      .status(StatusCodes.OK)
      .json({ msg: `Success delete dashboard ${dashboardId}` });
  } else {
    throw new NotFoundError(`No dashboard with id ${dashboardId}`);
  }
};

module.exports = {
  getAllDashboard,
  getDashboard,
  addDashboard,
  updateDashboard,
  deleteDashboard
};
