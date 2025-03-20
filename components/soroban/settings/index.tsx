import { IDESettings, SettingLayer } from "@/components/core/components/settings"
import { Title } from "@/components/core/components/title"
import { PROJECT_NAME } from "@/lib/core/config"
import { NetworkButton } from "./network-button"
import { TomlPathInput } from "./toml-path-input"

interface ProgramSettingsProps extends React.HTMLAttributes<HTMLDivElement> { }

export function ProgramSettings({ }: ProgramSettingsProps) {
    return <IDESettings>
        <SettingLayer className="flex items-center justify-between">
            <Title text={`${PROJECT_NAME} Toml Path`} />
            <TomlPathInput />
        </SettingLayer>
        <SettingLayer className="flex items-center justify-between">
            <Title text="Networks" />
            <NetworkButton />
        </SettingLayer>
    </IDESettings>
}
