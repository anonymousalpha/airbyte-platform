import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { render } from "test-utils";
import { mockWorkspace } from "test-utils/mock-data/mockWorkspace";

import { FeatureItem } from "core/services/features";
import messages from "locales/en.json";

import { NotificationSettingsForm } from "./NotificationSettingsForm";

jest.mock("hooks/services/AppMonitoringService");

jest.mock("core/api", () => ({
  useCurrentWorkspace: () => ({
    ...mockWorkspace,
    notificationSettings: { ...mockWorkspace.notificationSettings, sendOnConnectionUpdate: { notificationType: [] } },
  }),
  useTryNotificationWebhook: () => jest.fn(),
}));

describe(`${NotificationSettingsForm.name}`, () => {
  it("should render", async () => {
    const { getByTestId } = await render(<NotificationSettingsForm updateNotificationSettings={jest.fn()} />);
    await waitFor(() => expect(getByTestId("notification-settings-form")).toBeInTheDocument());
  });

  it("should display not display email toggles if the feature is disabled", async () => {
    const { queryByTestId } = await render(
      <NotificationSettingsForm updateNotificationSettings={jest.fn()} />,
      undefined,
      []
    );
    await waitFor(() => expect(queryByTestId("sendOnFailure.email")).toEqual(null));
  });

  it("should display display email toggles if the feature is enabled", async () => {
    const { getByTestId } = await render(
      <NotificationSettingsForm updateNotificationSettings={jest.fn()} />,
      undefined,
      [FeatureItem.EmailNotifications]
    );
    await waitFor(() => expect(getByTestId("sendOnFailure.email")).toBeDefined());
  });

  it("calls updateNotificationSettings with the correct values", async () => {
    const mockUpdateNotificationSettings = jest.fn();
    const { getByText, getByTestId } = await render(
      <NotificationSettingsForm updateNotificationSettings={mockUpdateNotificationSettings} />,
      undefined,
      [FeatureItem.EmailNotifications]
    );
    const sendOnSuccessToggle = getByTestId("sendOnConnectionUpdate.email");
    userEvent.click(sendOnSuccessToggle);
    const submitButton = getByText(messages["form.saveChanges"]);
    userEvent.click(submitButton);
    await waitFor(() => expect(mockUpdateNotificationSettings).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockUpdateNotificationSettings).toHaveBeenCalledWith({
        ...mockWorkspace.notificationSettings,
        sendOnConnectionUpdate: { notificationType: ["customerio"] },
      })
    );
  });
});
