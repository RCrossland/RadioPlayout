using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(RadioPlayout.Startup))]
namespace RadioPlayout
{
	public partial class Startup
	{
		public void Configuration(IAppBuilder app)
		{
			ConfigureAuth(app);
		}
	}
}
