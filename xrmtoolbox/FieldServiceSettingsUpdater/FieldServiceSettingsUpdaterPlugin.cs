using System.ComponentModel.Composition;
using XrmToolBox.Extensibility;
using XrmToolBox.Extensibility.Interfaces;

namespace FieldServiceSettingsUpdater
{
    /// <summary>
    /// XrmToolBox plugin registration. The actual UI lives in <see cref="SettingsControl"/>.
    /// XrmToolBox discovers this via MEF (the [Export] attributes) when the dll is dropped
    /// into the Plugins folder.
    /// </summary>
    [Export(typeof(IXrmToolBoxPlugin))]
    [ExportMetadata("Name", "Field Service Resource Updater")]
    [ExportMetadata("Description", "Bulk-update Field Service Bookable Resource settings across many resources at once: Start/End Location, Organizational Unit, Display on Schedule Board, Enable for Availability Search, Hourly Rate and Time Off Approval; set work hours by weekly pattern or by copying another resource; and quick add/remove skills (characteristics) and territories for everyone selected.")]
    [ExportMetadata("Author", "Mark Christie")]
    [ExportMetadata("BackgroundColor", "DarkSlateGray")]
    [ExportMetadata("PrimaryFontColor", "White")]
    [ExportMetadata("SecondaryFontColor", "WhiteSmoke")]
    [ExportMetadata("SmallImageBase64", IconData.Small)]
    [ExportMetadata("BigImageBase64", IconData.Big)]
    public class FieldServiceSettingsUpdaterPlugin : PluginBase
    {
        public override IXrmToolBoxPluginControl GetControl()
        {
            return new SettingsControl();
        }
    }
}
