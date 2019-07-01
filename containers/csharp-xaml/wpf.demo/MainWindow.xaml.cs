using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

using Fin = Openfin.Desktop;

namespace linedata.trading.demo
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        const string UrlRoot = "http://localhost:3002/";
        const string BlotterUrlRoot = "http://localhost:3001/";

        Fin.Runtime Runtime;
        Fin.Messaging.ChannelProvider WindowManagerChannel;

        Openfin.WPF.EmbeddedView[] EmbeddedViews;

        public MainWindow()
        {
            InitializeComponent();

            EmbeddedViews = new Openfin.WPF.EmbeddedView[]
            {
                TopBar,
                SideBar,
                Blotter,
                TopChart,
                BottomChart
            };

            var runtimeOptions = Fin.RuntimeOptions.LoadDefault();
            Runtime = Fin.Runtime.GetRuntimeInstance(runtimeOptions);

            Runtime.Connect(RuntimeConnected);
        }

        private void RuntimeConnected()
        {
            var topBarAppOptions = new Fin.ApplicationOptions("topBarApp", "topBarApp", UrlRoot + "color.html");
            TopBar.Initialize(Runtime.Options, topBarAppOptions);

            var sideBarAppOptions = new Fin.ApplicationOptions("sideBarApp", "sideBarApp", UrlRoot + "color.html");
            SideBar.Initialize(Runtime.Options, sideBarAppOptions);

            var blotterAppOptions = new Fin.ApplicationOptions("blotterApp", "blotterApp", BlotterUrlRoot);
            Blotter.Initialize(Runtime.Options, blotterAppOptions);

            var topChartAppOptions = new Fin.ApplicationOptions("topChartApp", "topChartApp", UrlRoot);
            TopChart.Initialize(Runtime.Options, topChartAppOptions);

            var bottomChartAppOptions = new Fin.ApplicationOptions("bottomChartApp", "bottomChartApp", UrlRoot);
            BottomChart.Initialize(Runtime.Options, bottomChartAppOptions);

            Fin.InterApplicationBus.Subscription<string>(Runtime, "window-manager/popout").MessageReceived += MainWindow_PopoutMessageReceived;
            Fin.InterApplicationBus.Subscription<string>(Runtime, "window-manager/popin").MessageReceived += MainWindow_PopinMessageReceived;

            //WindowManagerChannel = Runtime.InterApplicationBus.Channel.CreateProvider("window-manager");

            //WindowManagerChannel.RegisterTopic("popout", new Func<string,object>(OnPopout));
            //WindowManagerChannel.RegisterTopic("popin", new Func<string,object>(OnPopin));

            //WindowManagerChannel.OpenAsync();
        }

        private void MainWindow_PopoutMessageReceived(object sender, Fin.Messaging.MessageBusMessageEventArgs<string> e)
        {
            OnPopout(e.Message);
        }

        private void MainWindow_PopinMessageReceived(object sender, Fin.Messaging.MessageBusMessageEventArgs<string> e)
        {
            OnPopin(e.Message);
        }

        private object OnPopout(string uuid)
        {
            Dispatcher.Invoke(() => 
            {
                var requestingView = EmbeddedViews.FirstOrDefault(ev => ev.OpenfinApplication.Uuid == uuid);

                if (requestingView == null)
                {
                    return;
                }

                var size = requestingView.RenderSize;

                requestingView.Tag = requestingView.Parent;
                (requestingView.Parent as Grid).Children.Remove(requestingView);

                var viewHost = new Grid();
                viewHost.Children.Add(requestingView);

                var popout = new Window()
                {
                    Content = viewHost,
                    Height = size.Height + 20,
                    Width = size.Width
                };

                popout.Closing += Popout_Closing;
                popout.Show();
            });

            return true;
        }

        private void Popout_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            var closingWin = sender as Window;
            var closingGrid = closingWin.Content as Grid;

            if(closingGrid.Children.Count > 0)
            {
                OnPopin((closingGrid.Children[0] as Openfin.WPF.EmbeddedView).OpenfinApplication.Uuid, false);
            }
        }

        private object OnPopin(string uuid)
        {
            return OnPopin(uuid, true);
        }

        private object OnPopin(string uuid, bool close)
        {
            Dispatcher.Invoke(() =>
            {
                var requestingView = EmbeddedViews.FirstOrDefault(ev => ev.OpenfinApplication.Uuid == uuid);

                if (requestingView == null)
                {
                    return;
                }

                var popout = GetWindow(requestingView);

                (requestingView.Parent as Grid).Children.Remove(requestingView);
                (requestingView.Tag as Grid).Children.Add(requestingView);
                if (close)
                {
                    popout.Close();
                }
            });

            return true;
        }
    }
}
