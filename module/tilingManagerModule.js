const Main = imports.ui.main;

/* exported TilingManagerModule */
var TilingManagerModule = class TilingManagerModule {
    constructor() {
        this.workspaceManager = global.workspace_manager;
        this.grabInProgress = false;
    }

    enable() {
        for (let w = 0; w < this.workspaceManager.n_workspaces; w++) {
            let workspace = this.workspaceManager.get_workspace_by_index(w);
            workspace.connect('window-added', (workspace, window) => {
                window._sizeChangedId = window.connect('size-changed',
                    () => {
                        if (!this.grabInProgress) {
                            this.tileWindows(workspace);
                        }
                    });
                window._posChangedId = window.connect('position-changed',
                    () => {
                        if (!this.grabInProgress) {
                            this.tileWindows(workspace);
                        }
                    });
                this.tileWindows(workspace);
            });
            workspace.connect('window-removed', (workspace, window) => {
                this.tileWindows(workspace);
            });
        }

        global.display.connect('grab-op-begin', () => {
            this.grabInProgress = true;
        });

        global.display.connect('grab-op-end', () => {
            this.grabInProgress = false;
            this.tileWindows(this.workspaceManager.get_active_workspace());
        });
    }

    disable() {

    }

    tileWindows(workspace) {
        //this.tileMaximize(workspace.list_windows());
        this.tileRight(workspace.list_windows(), {});
    }

    tileMaximize(windows) {
        let workArea = Main.layoutManager.getWorkAreaForMonitor(window.monitor);
        windows.forEach((window) => {
            window.move_resize_frame(true, workArea.x, workArea.y, workArea.width, workArea.height);
        });
    }

    tileRight(windows, tilingData) {
        tilingData = tilingData || {};
        let workArea = Main.layoutManager.getWorkAreaForMonitor(window.monitor);
        let masterWidth = tilingData.masterWidth || windows.length > 1 ? workArea.width / 2 : workArea.width;
        let masterWindow = windows.shift();
        masterWindow.move_resize_frame(true, workArea.x, workArea.y, masterWidth, workArea.height);

        windows.forEach((window, index) => {
            window.move_resize_frame(window, workArea.x + masterWidth, workArea.y + (index * workArea.height / windows.length), workArea.width - masterWidth, workArea.height / windows.length);
        });
    }
};

/* local t = param.tag or capi.screen[param.screen].selected_tag

    -- This handles all different orientations.
    local width = "width"
    local x = "x"


    local gs = param.geometries
    local cls = param.clients
    local useless_gap = param.useless_gap
    local nmaster = math.min(t.master_count, #cls)
    local nother = math.max(#cls - nmaster,0)

    local mwfact = t.master_width_factor
    local wa = param.workarea
    local ncol = t.column_count

    local data = tag.getdata(t).windowfact

    if not data then
        data = {}
        tag.getdata(t).windowfact = data
    end

    local coord = wa[x]
    local place_master = true


    local grow_master = t.master_fill_policy == "expand"
    -- this was easier than writing functions because there is a lot of data we need
    for _ = 1,2 do
        if place_master and nmaster > 0 then
            local size = wa[width]
            if nother > 0 or not grow_master then
                size = math.min(wa[width] * mwfact, wa[width] - (coord - wa[x]))
            end
            if nother == 0 and not grow_master then
              coord = coord + (wa[width] - size)/2
            end
            if not data[0] then
                data[0] = {}
            end
            coord = coord + tile_group(gs, cls, wa, orientation, data[0],
                                       {first=1, last=nmaster, coord = coord, size = size}, useless_gap)
        end

        if not place_master and nother > 0 then
            local last = nmaster

            -- we have to modify the work area size to consider left and top views
            local wasize = wa[width]
            if nmaster > 0 and (orientation == "left" or orientation == "top") then
                wasize = wa[width] - wa[width]*mwfact
            end
            for i = 1,ncol do
                -- Try to get equal width among remaining columns
                local size = math.min( (wasize - (coord - wa[x])) / (ncol - i + 1) )
                local first = last + 1
                last = last + math.floor((#cls - last)/(ncol - i + 1))
                -- tile the column and update our current x coordinate
                if not data[i] then
                    data[i] = {}
                end
                coord = coord + tile_group(gs, cls, wa, orientation, data[i],
                                           { first = first, last = last, coord = coord, size = size }, useless_gap)
            end
        end
        place_master = not place_master
    end */

